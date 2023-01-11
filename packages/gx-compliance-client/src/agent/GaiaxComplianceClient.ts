import { IAgentPlugin, IIdentifier, W3CVerifiableCredential } from '@veramo/core'

import {
  GXRequiredContext,
  IAcquireComplianceCredentialFromExistingParticipantArgs,
  IGaiaxComplianceClient,
  IGaiaxCredentialType,
  IImportDIDArg,
  IIssueAndSaveVerifiablePresentationArgs,
  IOnboardParticipantWithCredentialArgs,
  IOnboardParticipantWithCredentialIdsArgs,
  schema,
  VerifiableCredentialResponse,
  VerifiablePresentationResponse,
} from '../index'

import {
  IAcquireComplianceCredentialFromUnsignedParticipantArgs,
  IAddServiceOfferingArgs,
  IAddServiceOfferingUnsignedArgs,
  IGaiaxComplianceClientArgs,
  IGaiaxOnboardingResult,
  IAcquireComplianceCredentialArgs,
  IIssueVerifiableCredentialArgs,
  IIssueVerifiablePresentationArgs,
} from '../types'
import { AdditionalClaims, ICredentialSubject, IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types'

import { VerifiableCredentialSP, VerifiablePresentationSP } from '@sphereon/ssi-sdk-core'

import { v4 as uuidv4 } from 'uuid'
import fetch from 'cross-fetch'
import { DID } from './DID'

/**
 * {@inheritDoc IGaiaxComplianceClient}
 */
export class GaiaxComplianceClient implements IAgentPlugin {
  readonly schema = schema.IGaiaxComplianceClient
  readonly methods: IGaiaxComplianceClient = {
    createDIDFromX509: this.createDIDFromX509.bind(this),
    issueVerifiableCredential: this.issueVerifiableCredential.bind(this),
    issueVerifiablePresentation: this.issueVerifiablePresentation.bind(this),
    acquireComplianceCredential: this.acquireComplianceCredential.bind(this),
    acquireComplianceCredentialFromUnsignedParticipant: this.acquireComplianceCredentialFromUnsignedParticipant.bind(this),
    acquireComplianceCredentialFromExistingParticipant: this.acquireComplianceCredentialFromExistingParticipant.bind(this),
    onboardParticipantWithCredentialIds: this.onboardParticipantWithCredentialIds.bind(this),
    onboardParticipantWithCredential: this.onboardParticipantWithCredential.bind(this),
    addServiceOfferingUnsigned: this.addServiceOfferingUnsigned.bind(this),
    addServiceOffering: this.addServiceOffering.bind(this),
  }
  private readonly complianceServiceUrl: string
  private readonly complianceServiceVersion: string
  private readonly participantDid: string
  private readonly participantUrl: string
  private readonly defaultKMS?: string

  constructor(options: IGaiaxComplianceClientArgs) {
    this.defaultKMS = options.defaultKms
    this.complianceServiceUrl = options.complianceServiceUrl
    this.complianceServiceVersion = options.complianceServiceVersion
    this.participantDid = options.participantDid
    this.participantUrl = options.participantUrl
  }

  private async createDIDFromX509(args: IImportDIDArg, context: GXRequiredContext): Promise<IIdentifier> {
    return DID.createDIDFromX509(
      {
        ...args,
        kms: args.kms ? args.kms : this.defaultKMS ? this.defaultKMS : 'local',
      },
      context
    )
  }

  /** {@inheritDoc IGaiaxComplianceClient.issueVerifiableCredential} */
  private async issueVerifiableCredential(args: IIssueVerifiableCredentialArgs, context: GXRequiredContext): Promise<IVerifiableCredential> {
    const verifiableCredentialSP = await context.agent.createVerifiableCredentialLDLocal({
      credential: args.credential,
      purpose: args.purpose,
      keyRef: args.keyRef,
    })
    return verifiableCredentialSP as IVerifiableCredential
  }

  /** {@inheritDoc IGaiaxComplianceClient.issueAndSaveVerifiablePresentation} */
  private async issueAndSaveVerifiablePresentation(
    args: IIssueAndSaveVerifiablePresentationArgs,
    context: GXRequiredContext
  ): Promise<VerifiablePresentationResponse> {
    const vp: IVerifiablePresentation = await this.issueVerifiablePresentation(
      {
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.staticDateChallenge(),
        keyRef: args.keyRef,
        purpose: args.purpose,
        verifiableCredentials: args.verifiableCredentials as W3CVerifiableCredential[],
        verificationMethodId: args.verificationMethodId,
      },
      context
    )
    const selfDescribedVPHash = await context.agent.dataStoreSaveVerifiablePresentation({
      verifiablePresentation: vp as VerifiablePresentationSP,
    })
    return {
      verifiablePresentation: vp,
      vpHash: selfDescribedVPHash,
    }
  }

  /** {@inheritDoc IGaiaxComplianceClient.issueVerifiablePresentation} */
  private async issueVerifiablePresentation(args: IIssueVerifiablePresentationArgs, context: GXRequiredContext): Promise<IVerifiablePresentation> {
    return (await context.agent.createVerifiablePresentationLDLocal({
      presentation: {
        id: uuidv4(),
        issuanceDate: new Date(),
        type: ['VerifiablePresentation'],
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        verifiableCredential: args.verifiableCredentials,
        holder: this.participantDid,
      },
      purpose: args.purpose,
      keyRef: args.keyRef,
      challenge: args.challenge ? args.challenge : GaiaxComplianceClient.staticDateChallenge(),
      domain: this.complianceServiceUrl,
    })) as IVerifiablePresentation
  }

  /** {@inheritDoc IGaiaxComplianceClient.acquireComplianceCredential} */
  private async acquireComplianceCredential(args: IAcquireComplianceCredentialArgs, _context: GXRequiredContext): Promise<IVerifiableCredential> {
    try {
      return (await GaiaxComplianceClient.postRequest(
        this.getApiVersionedUrl() + '/sign',
        JSON.stringify(args.selfDescribedVP)
      )) as IVerifiableCredential
    } catch (e) {
      throw new Error('Error on fetching complianceCredential: ' + e)
    }
  }

  /** {@inheritDoc IGaiaxComplianceClient.acquireComplianceCredentialFromUnsignedParticipant} */
  private async acquireComplianceCredentialFromUnsignedParticipant(
    args: IAcquireComplianceCredentialFromUnsignedParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const selfDescribedVC: IVerifiableCredential = await this.issueVerifiableCredential(
      {
        credential: args.credential,
        verificationMethodId: args.verificationMethodId,
        purpose: args.purpose,
        keyRef: args.keyRef,
      },
      context
    )
    const selfDescribedVCHash = await context.agent.dataStoreSaveVerifiableCredential({
      verifiableCredential: selfDescribedVC as VerifiableCredentialSP,
    })

    console.log(selfDescribedVCHash)
    const verifiablePresentationResponse: VerifiablePresentationResponse = await this.issueAndSaveVerifiablePresentation(
      {
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.staticDateChallenge(),
        keyRef: args.keyRef,
        purpose: args.purpose,
        verifiableCredentials: [selfDescribedVC as IVerifiableCredential],
        verificationMethodId: args.verificationMethodId,
      },
      context
    )
    const verifiableCredentialResponse = (await this.acquireComplianceCredentialFromVerifiablePresentation(
      {
        verifiablePresentation: verifiablePresentationResponse.verifiablePresentation,
      },
      context
    )) as VerifiableCredentialResponse
    return verifiableCredentialResponse
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
        purpose: args.purpose,
        keyRef: args.keyRef,
        credential: args.credential,
        verificationMethodId: args.verificationMethodId,
      },
      context
    )) as W3CVerifiableCredential
    const serviceOfferingVP = await this.issueVerifiablePresentation(
      {
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.staticDateChallenge(),
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

  /** {@inheritDoc IGaiaxComplianceClient.acquireComplianceCredentialFromExistingParticipant} */
  private async acquireComplianceCredentialFromExistingParticipant(
    args: IAcquireComplianceCredentialFromExistingParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const selfDescribedVC = (await context.agent.dataStoreGetVerifiableCredential({
      hash: args.participantVChash,
    })) as IVerifiableCredential
    const verifiablePresentationResponse: VerifiablePresentationResponse = await this.issueAndSaveVerifiablePresentation(
      {
        keyRef: args.keyRef,
        purpose: args.purpose,
        verifiableCredentials: [selfDescribedVC],
        challenge: args.challenge,
        verificationMethodId: args.verificationMethodId,
      },
      context
    )
    return this.acquireComplianceCredentialFromVerifiablePresentation(
      {
        verifiablePresentation: verifiablePresentationResponse.verifiablePresentation,
      },
      context
    )
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

  private async acquireComplianceCredentialFromVerifiablePresentation(
    args: { verifiablePresentation: IVerifiablePresentation },
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const complianceCredential = await this.acquireComplianceCredential(
      {
        selfDescribedVP: args.verifiablePresentation,
      },
      context
    )
    const hash: string = await context.agent.dataStoreSaveVerifiableCredential({
      verifiableCredential: complianceCredential as VerifiableCredentialSP,
    })
    return {
      verifiableCredential: complianceCredential,
      hash,
    }
  }

  private async onboardParticipantWithCredential(args: IOnboardParticipantWithCredentialArgs, context: GXRequiredContext) {
    const onboardingVP = await this.issueVerifiablePresentation(
      {
        keyRef: args.keyRef,
        purpose: args.purpose,
        verifiableCredentials: [args.complianceCredential as W3CVerifiableCredential, args.selfDescribedVC as W3CVerifiableCredential],
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.staticDateChallenge(),
        verificationMethodId: args.verificationMethodId,
      },
      context
    )

    // todo: This logic should be a function
    const credentialType = args.selfDescribedVC['type'].find((el) => el !== 'VerifiableCredential')
    const apiType = credentialType === IGaiaxCredentialType.LegalPerson || IGaiaxCredentialType.NaturalPerson ? 'participant' : 'service-offering'
    const URL = `${this.getApiVersionedUrl()}/${apiType}/verify/raw?store=true`

    try {
      return (await GaiaxComplianceClient.postRequest(URL, onboardingVP as unknown as BodyInit)) as IVerifiableCredential
    } catch (e) {
      throw new Error('Error on onboarding a complianceCredential: ' + e)
    }
  }

  private async onboardParticipantWithCredentialIds(args: IOnboardParticipantWithCredentialIdsArgs, context: GXRequiredContext) {
    const complianceCredential = (await context.agent.dataStoreGetVerifiableCredential({
      hash: args.complianceCredentialHash,
    })) as IVerifiableCredential
    const selfDescribedVC = (await context.agent.dataStoreGetVerifiableCredential({
      hash: args.selfDescribedVcHash,
    })) as IVerifiableCredential
    return this.onboardParticipantWithCredential(
      {
        complianceCredential: complianceCredential,
        selfDescribedVC: selfDescribedVC,
        keyRef: args.keyRef,
        purpose: args.purpose,
        verificationMethodId: args.verificationMethodId,
        challenge: args.challenge,
      },
      context
    )
  }
}
