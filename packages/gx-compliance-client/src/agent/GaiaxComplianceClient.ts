import { IAgentPlugin, W3CVerifiableCredential } from '@veramo/core'

import { IGaiaxComplianceClient, IGaiaxCredentialType, IRequiredContext, schema } from '../index'

import {
  IAddServiceOfferingArgs,
  IAddServiceOfferingUnsignedArgs,
  IGaiaxComplianceClientArgs,
  IGaiaxOnboardingResult,
  IGetComplianceCredentialArgs,
  IGetComplianceCredentialFromUnsignedParticipantArgs,
  IIssueVerifiableCredentialArgs,
  IIssueVerifiablePresentationArgs,
} from '../types/IGaiaxComplianceClient'
import { AdditionalClaims, ICredentialSubject, IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types'
import { v4 as uuidv4 } from 'uuid'
import fetch from 'cross-fetch'
import { LdContextLoader, LdCredentialModule, LdSuiteLoader } from '@sphereon/ssi-sdk-vc-handler-ld-local'

/**
 * {@inheritDoc IGaiaxComplianceClient}
 */
export class GaiaxComplianceClient implements IAgentPlugin {
  readonly schema = schema.IGaiaxComplianceClient
  readonly methods: IGaiaxComplianceClient = {
    issueVerifiableCredential: this.issueVerifiableCredential.bind(this),
    issueVerifiablePresentation: this.issueVerifiablePresentation.bind(this),
    getComplianceCredential: this.getComplianceCredential.bind(this),
    getComplianceCredentialFromUnsignedParticipant: this.getComplianceCredentialFromUnsignedParticipant.bind(this),
    addServiceOfferingUnsigned: this.addServiceOfferingUnsigned.bind(this),
    addServiceOffering: this.addServiceOffering.bind(this),
  }
  private readonly complianceServiceUrl: string
  private readonly complianceServiceVersion: string
  private readonly participantDid: string
  private readonly participantUrl: string

  private ldCredentialModule: LdCredentialModule

  constructor(options: IGaiaxComplianceClientArgs) {
    this.complianceServiceUrl = options.complianceServiceUrl
    this.complianceServiceVersion = options.complianceServiceVersion
    this.participantDid = options.participantDid
    this.participantUrl = options.participantUrl
    this.ldCredentialModule = new LdCredentialModule({
      ldContextLoader: new LdContextLoader({ contextsPaths: options.credentialHandlerOptions.contextMaps }),
      ldSuiteLoader: new LdSuiteLoader({ ldSignatureSuites: options.credentialHandlerOptions.suites }),
    })
  }

  /** {@inheritDoc IGaiaxComplianceClient.issueVerifiableCredential} */
  private async issueVerifiableCredential(args: IIssueVerifiableCredentialArgs, context: IRequiredContext): Promise<IVerifiableCredential> {
    const verifiableCredentialSP = await this.ldCredentialModule.issueLDVerifiableCredential(
      {
        issuanceDate: new Date(),
        credentialSubject: args.subject,
        type: ['VerifiableCredential', args.type],
        issuer: this.participantDid,
        // magic number for 6 month later
        expirationDate: new Date(new Date().getDate() + 15552000000),
        id: uuidv4(),
        '@context': ['https://www.w3.org/2018/credentials/v1', args.customContext],
      },
      this.participantDid,
      args.key,
      args.verificationMethodId,
      args.purpose,
      context
    )
    return verifiableCredentialSP as IVerifiableCredential
  }

  /** {@inheritDoc IGaiaxComplianceClient.issueVerifiablePresentation} */
  private async issueVerifiablePresentation(args: IIssueVerifiablePresentationArgs, context: IRequiredContext): Promise<IVerifiablePresentation> {
    return (await this.ldCredentialModule.signLDVerifiablePresentation(
      {
        id: uuidv4(),
        issuanceDate: new Date(),
        type: ['VerifiablePresentation'],
        // magic number for 2 hour later
        expirationDate: new Date(new Date().getDate() + 7200000),
        '@context': ['https://www.w3.org/2018/credentials/v1', args.customContext],
        verifiableCredential: args.verifiableCredentials,
        holder: this.participantDid,
      },
      this.participantDid,
      args.key,
      args.verificationMethodId,
      args.challenge ? args.challenge : this.getChallenge(),
      this.complianceServiceUrl,
      args.purpose,
      context
    )) as IVerifiablePresentation
  }

  /** {@inheritDoc IGaiaxComplianceClient.getComplianceCredential} */
  private async getComplianceCredential(args: IGetComplianceCredentialArgs, _context: IRequiredContext): Promise<IVerifiableCredential> {
    try {
      return (await GaiaxComplianceClient.postRequest(
        this.getApiVersionedUrl() + '/sign',
        args.selfDescribedVP as unknown as BodyInit
      )) as IVerifiableCredential
    } catch (e) {
      throw new Error('Error on fetching complianceCredential: ' + e)
    }
  }

  /** {@inheritDoc IGaiaxComplianceClient.getComplianceCredentialFromUnsignedParticipant} */
  private async getComplianceCredentialFromUnsignedParticipant(
    args: IGetComplianceCredentialFromUnsignedParticipantArgs,
    context: IRequiredContext
  ): Promise<IVerifiableCredential> {
    const selfDescribedVC: IVerifiableCredential = await this.issueVerifiableCredential(
      {
        customContext: args.customContext,
        verificationMethodId: args.verificationMethodId,
        key: args.key,
        purpose: args.purpose,
        subject: args.subject,
        //TODO: error handling. only accepts NaturalPerson and LegalPerson
        type: args.type,
      },
      context
    )
    const selfDescribedVP = await this.issueVerifiablePresentation(
      {
        challenge: args.challenge ? args.challenge : this.getChallenge(),
        customContext: args.customContext,
        key: args.key,
        purpose: args.purpose,
        verifiableCredentials: [selfDescribedVC as W3CVerifiableCredential],
        verificationMethodId: args.verificationMethodId,
      },
      context
    )
    const complianceCredential = await this.getComplianceCredential(
      {
        selfDescribedVP: selfDescribedVP,
      },
      context
    )
    //TODO: implement this
    //saveVC(complianceCredential)

    const onboardingVP = await this.issueVerifiablePresentation(
      {
        customContext: args.customContext,
        key: args.key,
        purpose: args.purpose,
        verifiableCredentials: [complianceCredential as W3CVerifiableCredential, selfDescribedVC as W3CVerifiableCredential],
        challenge: args.challenge ? args.challenge : this.getChallenge(),
        verificationMethodId: args.verificationMethodId,
      },
      context
    )
    const apiType = args.type === IGaiaxCredentialType.LegalPerson || IGaiaxCredentialType.NaturalPerson ? 'participant' : 'service-offering'
    const URL = `${this.getApiVersionedUrl()}/${apiType}/verify/raw?store=true`
    try {
      return (await GaiaxComplianceClient.postRequest(URL, onboardingVP as unknown as BodyInit)) as IVerifiableCredential
    } catch (e) {
      throw new Error('Error on onboarding a complianceCredential: ' + e)
    }
  }

  /** {@inheritDoc IGaiaxComplianceClient.addServiceOfferingUnsigned} */
  private async addServiceOfferingUnsigned(args: IAddServiceOfferingUnsignedArgs, context: IRequiredContext): Promise<IGaiaxOnboardingResult> {
    //TODO: implement fetching compliance VC from data storage
    const complianceCredential: W3CVerifiableCredential = null as unknown as W3CVerifiableCredential
    if (
      !(
        (complianceCredential as IVerifiableCredential).credentialSubject as (ICredentialSubject & AdditionalClaims)['providedBy'] as string
      ).startsWith(this.participantUrl)
    ) {
      throw new Error(`ServiceOffering providedBy should start with ${this.participantUrl}`)
    }
    //TODO: error handling on null complianceCredential
    const serviceOfferingVC: W3CVerifiableCredential = (await this.issueVerifiableCredential(
      {
        customContext: args.customContext,
        key: args.key,
        purpose: args.purpose,
        //TODO: handle error, only ServiceOffering is allowed here
        type: args.type,
        subject: args.subject,
        verificationMethodId: args.verificationMethodId,
      },
      context
    )) as W3CVerifiableCredential
    const serviceOfferingVP = await this.issueVerifiablePresentation(
      {
        challenge: args.challenge ? args.challenge : this.getChallenge(),
        customContext: args.customContext,
        key: args.key,
        purpose: args.purpose,
        verifiableCredentials: [complianceCredential, serviceOfferingVC],
        verificationMethodId: args.verificationMethodId,
      },
      context
    )
    return await this.addServiceOffering(
      {
        serviceOfferingVP: serviceOfferingVP,
      },
      context
    )
  }

  /** {@inheritDoc IGaiaxComplianceClient.addServiceOffering} */
  private async addServiceOffering(args: IAddServiceOfferingArgs, _context: IRequiredContext): Promise<IGaiaxOnboardingResult> {
    try {
      return (await GaiaxComplianceClient.postRequest(
        this.getApiVersionedUrl() + '/service-offering/verify/raw',
        args.serviceOfferingVP as unknown as BodyInit
      )) as IGaiaxOnboardingResult
    } catch (e) {
      throw new Error('Error on fetching complianceCredential: ' + e)
    }
  }

  private getChallenge(): string {
    return new Date().getUTCFullYear() + '-' + (new Date().getUTCMonth() + 1) + '-' + new Date().getUTCDay()
  }

  private static async postRequest(url: string, body: BodyInit): Promise<unknown> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      })
      if (!response || !response.status || response.status < 200 || response.status >= 400) {
        throw new Error(`Can't get the response from ${url}`)
      }
      return await response.json()
    } catch (error) {
      throw new Error(`${(error as Error).message}`)
    }
  }

  private getApiVersionedUrl() {
    return `${this.complianceServiceUrl}${this.complianceServiceVersion ? '/v' + this.complianceServiceVersion : ''}/api`
  }
}
