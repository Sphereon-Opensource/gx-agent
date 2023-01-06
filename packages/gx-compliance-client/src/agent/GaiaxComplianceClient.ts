import { IAgentPlugin, W3CVerifiableCredential } from '@veramo/core'

import { GXRequiredContext, IGaiaxComplianceClient, IGaiaxCredentialType, schema } from '../index'

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

import { VerifiableCredentialSP, VerifiablePresentationSP } from '@sphereon/ssi-sdk-core'

import { v4 as uuidv4 } from 'uuid'
import fetch from 'cross-fetch'

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

  constructor(options: IGaiaxComplianceClientArgs) {
    this.complianceServiceUrl = options.complianceServiceUrl
    this.complianceServiceVersion = options.complianceServiceVersion
    this.participantDid = options.participantDid
    this.participantUrl = options.participantUrl
  }

  /** {@inheritDoc IGaiaxComplianceClient.issueVerifiableCredential} */
  private async issueVerifiableCredential(args: IIssueVerifiableCredentialArgs, context: GXRequiredContext): Promise<IVerifiableCredential> {
    const verifiableCredentialSP = await context.agent.createVerifiableCredentialLDLocal({
      credential: {
        issuanceDate: new Date(),
        credentialSubject: args.subject,
        type: ['VerifiableCredential', args.type],
        issuer: this.participantDid,
        id: uuidv4(),
        '@context': ['https://www.w3.org/2018/credentials/v1', args.customContext],
      },
      purpose: args.purpose,
      keyRef: args.keyRef,
    })
    return verifiableCredentialSP as IVerifiableCredential
  }

  /** {@inheritDoc IGaiaxComplianceClient.issueVerifiablePresentation} */
  private async issueVerifiablePresentation(args: IIssueVerifiablePresentationArgs, context: GXRequiredContext): Promise<IVerifiablePresentation> {
    return (await context.agent.createVerifiablePresentationLDLocal({
      presentation: {
        id: uuidv4(),
        issuanceDate: new Date(),
        type: ['VerifiablePresentation'],
        '@context': ['https://www.w3.org/2018/credentials/v1', args.customContext],
        verifiableCredential: args.verifiableCredentials,
        holder: this.participantDid,
      },
      purpose: args.purpose,
      keyRef: args.keyRef,
      challenge: args.challenge ? args.challenge : GaiaxComplianceClient.staticDateChallenge(),
      domain: this.complianceServiceUrl,
    })) as IVerifiablePresentation
  }

  /** {@inheritDoc IGaiaxComplianceClient.getComplianceCredential} */
  private async getComplianceCredential(args: IGetComplianceCredentialArgs, _context: GXRequiredContext): Promise<IVerifiableCredential> {
    try {
      return (await GaiaxComplianceClient.postRequest(
        this.getApiVersionedUrl() + '/sign',
        JSON.stringify(args.selfDescribedVP)
      )) as IVerifiableCredential
    } catch (e) {
      throw new Error('Error on fetching complianceCredential: ' + e)
    }
  }

  /** {@inheritDoc IGaiaxComplianceClient.getComplianceCredentialFromUnsignedParticipant} */
  private async getComplianceCredentialFromUnsignedParticipant(
    args: IGetComplianceCredentialFromUnsignedParticipantArgs,
    context: GXRequiredContext
  ): Promise<IVerifiableCredential> {
    const selfDescribedVC: IVerifiableCredential = await this.issueVerifiableCredential(
      {
        customContext: args.customContext,
        verificationMethodId: args.verificationMethodId,
        keyRef: args.keyRef,
        purpose: args.purpose,
        subject: args.subject,
        //TODO: error handling. only accepts NaturalPerson and LegalPerson
        type: args.type,
      },
      context
    )
    const selfDescribedVCHash = await context.agent.dataStoreSaveVerifiableCredential({
      verifiableCredential: selfDescribedVC as VerifiableCredentialSP,
    })

    console.log(selfDescribedVCHash)

    const selfDescribedVP = await this.issueVerifiablePresentation(
      {
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.staticDateChallenge(),
        customContext: args.customContext,
        keyRef: args.keyRef,
        purpose: args.purpose,
        verifiableCredentials: [selfDescribedVC as W3CVerifiableCredential],
        verificationMethodId: args.verificationMethodId,
      },
      context
    )

    const selfDescribedVPHash = await context.agent.dataStoreSaveVerifiablePresentation({
      verifiablePresentation: selfDescribedVP as VerifiablePresentationSP,
    })
    console.log(selfDescribedVPHash)

    const complianceCredential = await this.getComplianceCredential(
      {
        selfDescribedVP: selfDescribedVP,
      },
      context
    )
    await context.agent.dataStoreSaveVerifiableCredential({ verifiableCredential: complianceCredential as VerifiableCredentialSP })

    const onboardingVP = await this.issueVerifiablePresentation(
      {
        customContext: args.customContext,
        keyRef: args.keyRef,
        purpose: args.purpose,
        verifiableCredentials: [complianceCredential as W3CVerifiableCredential, selfDescribedVC as W3CVerifiableCredential],
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.staticDateChallenge(),
        verificationMethodId: args.verificationMethodId,
      },
      context
    )

    // todo: This logic should be a function
    const apiType = args.type === IGaiaxCredentialType.LegalPerson || IGaiaxCredentialType.NaturalPerson ? 'participant' : 'service-offering'
    const URL = `${this.getApiVersionedUrl()}/${apiType}/verify/raw?store=true`

    try {
      return (await GaiaxComplianceClient.postRequest(URL, onboardingVP as unknown as BodyInit)) as IVerifiableCredential
    } catch (e) {
      throw new Error('Error on onboarding a complianceCredential: ' + e)
    }
  }

  /** {@inheritDoc IGaiaxComplianceClient.addServiceOfferingUnsigned} */
  private async addServiceOfferingUnsigned(args: IAddServiceOfferingUnsignedArgs, context: GXRequiredContext): Promise<IGaiaxOnboardingResult> {
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
        keyRef: args.keyRef,
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
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.staticDateChallenge(),
        customContext: args.customContext,
        keyRef: args.keyRef,
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
  private async addServiceOffering(args: IAddServiceOfferingArgs, _context: GXRequiredContext): Promise<IGaiaxOnboardingResult> {
    try {
      return (await GaiaxComplianceClient.postRequest(
        this.getApiVersionedUrl() + '/service-offering/verify/raw',
        args.serviceOfferingVP as unknown as BodyInit
      )) as IGaiaxOnboardingResult
    } catch (e) {
      throw new Error('Error on fetching complianceCredential: ' + e)
    }
  }

  private static staticDateChallenge(): string {
    return new Date().toISOString().substring(0, 10)
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
