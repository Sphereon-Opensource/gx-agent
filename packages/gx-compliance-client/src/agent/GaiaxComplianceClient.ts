import { IAgentPlugin, IIdentifier, VerifiableCredential, VerifiablePresentation } from '@veramo/core'

import {
  CredentialValidationResult,
  GXRequiredContext,
  IAcquireComplianceCredentialFromExistingParticipantArgs,
  IGaiaxComplianceClient,
  IImportDIDArg,
  IOnboardParticipantWithCredentialArgs,
  IOnboardParticipantWithCredentialIdsArgs,
  ISignatureInfo,
  IVerifySelfDescribedCredential,
  schema,
  VerifiableCredentialResponse,
  VerifiablePresentationResponse,
} from '../index'

import {
  IAcquireComplianceCredentialArgs,
  IAcquireComplianceCredentialFromUnsignedParticipantArgs,
  IAddServiceOfferingArgs,
  IAddServiceOfferingUnsignedArgs,
  IGaiaxComplianceConfig,
  IGaiaxOnboardingResult,
} from '../types'
import { ICredentialSubject, IVerifiableCredential } from '@sphereon/ssi-types'

import { VerifiableCredentialSP } from '@sphereon/ssi-sdk-core'
import { DID } from './DID'
import { CredentialHandler } from './CredentialHandler'
import { extractApiTypeFromVC } from '../utils/vc-extraction'
import { getApiVersionedUrl, postRequest } from '../utils/http'
import { extractSignatureInfo } from '../utils/did-utils'

/**
 * {@inheritDoc IGaiaxComplianceClient}
 */
export class GaiaxComplianceClient implements IAgentPlugin {
  public readonly config: IGaiaxComplianceConfig
  private readonly credentialHandler: CredentialHandler = new CredentialHandler(this)
  readonly schema = schema.IGaiaxComplianceClient

  constructor(config: IGaiaxComplianceConfig) {
    this.config = config
  }

  readonly methods: IGaiaxComplianceClient = {
    submitComplianceCredential: this.submitComplianceCredential.bind(this),
    acquireComplianceCredentialFromExistingParticipant: this.acquireComplianceCredentialFromExistingParticipant.bind(this),
    acquireComplianceCredentialFromUnsignedParticipant: this.acquireComplianceCredentialFromUnsignedParticipant.bind(this),
    submitServiceOffering: this.submitServiceOffering.bind(this),
    createAndSubmitServiceOffering: this.createAndSubmitServiceOffering.bind(this),
    createDIDFromX509: this.createDIDFromX509.bind(this),
    issueVerifiableCredential: this.credentialHandler.issueVerifiableCredential.bind(this),
    issueVerifiablePresentation: this.credentialHandler.issueVerifiablePresentation.bind(this),
    checkVerifiablePresentation: this.credentialHandler.checkVerifiablePresentation.bind(this),
    onboardParticipantWithCredential: this.onboardParticipantWithCredential.bind(this),
    onboardParticipantWithCredentialIds: this.onboardParticipantWithCredentialIds.bind(this),
    verifySelfDescription: this.verifySelfDescription.bind(this),
  }

  /** {@inheritDoc IGaiaxComplianceClient.submitComplianceCredential} */
  private async submitComplianceCredential(args: IAcquireComplianceCredentialArgs, _context: GXRequiredContext): Promise<VerifiableCredential> {
    try {
      return (await postRequest(this.getApiVersionedUrl() + '/sign', JSON.stringify(args.selfDescriptionVP))) as VerifiableCredential
    } catch (e) {
      throw new Error('Error on fetching complianceVC: ' + e)
    }
  }

  /** {@inheritDoc IGaiaxComplianceClient.acquireComplianceCredentialFromExistingParticipant} */
  private async acquireComplianceCredentialFromExistingParticipant(
    args: IAcquireComplianceCredentialFromExistingParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const selfDescribedVC = await context.agent.dataStoreGetVerifiableCredential({
      hash: args.participantSDHash,
    })
    const did = (selfDescribedVC.credentialSubject as ICredentialSubject)['id'] as string
    const signatureInfo: ISignatureInfo = await extractSignatureInfo(did, context)
    const verifiablePresentationResponse: VerifiablePresentationResponse = await this.credentialHandler.issueAndSaveVerifiablePresentation(
      {
        keyRef: signatureInfo.keyRef,
        purpose: signatureInfo.proofPurpose,
        verifiableCredentials: [selfDescribedVC],
        challenge: GaiaxComplianceClient.getDateChallenge(),
        verificationMethodId: signatureInfo.verificationMethodId,
      },
      context
    )
    return this.acquireComplianceCredential(
      {
        verifiablePresentation: verifiablePresentationResponse.verifiablePresentation,
      },
      context
    )
  }

  /** {@inheritDoc IGaiaxComplianceClient.acquireComplianceCredentialFromUnsignedParticipant} */
  private async acquireComplianceCredentialFromUnsignedParticipant(
    args: IAcquireComplianceCredentialFromUnsignedParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const signatureInfo: ISignatureInfo = await extractSignatureInfo(args.credential!.credentialSubject!.id as string, context)
    const selfDescribedVC: VerifiableCredential = await this.credentialHandler.issueVerifiableCredential(
      {
        credential: args.credential,
        verificationMethodId: signatureInfo.verificationMethodId,
        keyRef: signatureInfo.keyRef,
      },
      context
    )
    const selfDescribedVCHash = await context.agent.dataStoreSaveVerifiableCredential({
      verifiableCredential: selfDescribedVC as VerifiableCredentialSP,
    })

    console.log(selfDescribedVCHash)
    const verifiablePresentationResponse: VerifiablePresentationResponse = await this.credentialHandler.issueAndSaveVerifiablePresentation(
      {
        challenge: GaiaxComplianceClient.getDateChallenge(),
        keyRef: signatureInfo.keyRef,
        purpose: signatureInfo.proofPurpose,
        verifiableCredentials: [selfDescribedVC as VerifiableCredential],
        verificationMethodId: signatureInfo.verificationMethodId,
      },
      context
    )
    const verifiableCredentialResponse = (await this.acquireComplianceCredential(
      {
        verifiablePresentation: verifiablePresentationResponse.verifiablePresentation,
      },
      context
    )) as VerifiableCredentialResponse
    return verifiableCredentialResponse
  }

  /** {@inheritDoc IGaiaxComplianceClient.createAndSubmitServiceOffering} */
  private async createAndSubmitServiceOffering(args: IAddServiceOfferingUnsignedArgs, context: GXRequiredContext): Promise<IGaiaxOnboardingResult> {
    //TODO: implement fetching compliance VC from data storage
    if (!args.complianceHash && !args.complianceVC) {
      throw new Error('You should provide either complianceHash or complete complianceVC')
    }

    const complianceCredential = args.complianceHash
      ? await context.agent.dataStoreGetVerifiableCredential({
          hash: args.complianceHash,
        })
      : args.complianceVC!

    const serviceOfferingVC: VerifiableCredential = await this.credentialHandler.issueVerifiableCredential(
      {
        keyRef: args.keyRef,
        credential: args.serviceOfferingCredential,
        verificationMethodId: args.verificationMethodId,
      },
      context
    )
    const serviceOfferingVP = await this.credentialHandler.issueVerifiablePresentation(
      {
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.getDateChallenge(),
        keyRef: args.keyRef,
        // purpose: args.purpose,
        verifiableCredentials: [complianceCredential, serviceOfferingVC],
        verificationMethodId: args.verificationMethodId,
      },
      context
    )
    return await this.submitServiceOffering(
      {
        serviceOfferingVP: serviceOfferingVP,
      },
      context
    )
  }

  /** {@inheritDoc IGaiaxComplianceClient.submitServiceOffering} */
  private async submitServiceOffering(args: IAddServiceOfferingArgs, _context: GXRequiredContext): Promise<IGaiaxOnboardingResult> {
    try {
      return (await postRequest(
        this.getApiVersionedUrl() + '/service-offering/verify/raw',
        JSON.stringify(args.serviceOfferingVP)
      )) as IGaiaxOnboardingResult
    } catch (e) {
      throw new Error('Error on fetching complianceVC: ' + e)
    }
  }

  /** {@inheritDoc IGaiaxComplianceClient.createDIDFromX509} */
  private async createDIDFromX509(args: IImportDIDArg, context: GXRequiredContext): Promise<IIdentifier> {
    return DID.createDIDFromX509(
      {
        ...args,
        kms: args.kms ? args.kms : this.config.defaultKms ? this.config.defaultKms : 'local',
      },
      context
    )
  }

  /** {@inheritDoc IGaiaxComplianceClient.verifyUnsignedSelfDescribedCredential} */
  private async verifySelfDescription(args: IVerifySelfDescribedCredential, context: GXRequiredContext): Promise<CredentialValidationResult> {
    //TODO: right now we're just signing and if there's no error, we're confirming the credential object, later we might want ot incorporate some validations from gx-compliance service itself or even make an api there (just for verification and not saving anything)
    if (!args.verifiableCredential && !!args.hash) {
      throw new Error('You should provide either vc hash or vc itself')
    }

    try {
      let vc: IVerifiableCredential = args.verifiableCredential
        ? (args.verifiableCredential as IVerifiableCredential)
        : ((await context.agent.dataStoreGetVerifiableCredential({
            hash: args.hash as string,
          })) as IVerifiableCredential)
      let address = this.getApiVersionedUrl()
      if ((vc.type as string[]).indexOf('ServiceOffering') != -1) {
        address = address + '/service-offering/validate/vc'
      } else if ((vc.type as string[]).indexOf('LegalPerson') != -1 || (vc.type as string[]).indexOf('NaturalPerson') != -1) {
        address = address + '/participant/validate/vc'
      }
      return (await postRequest(address, JSON.stringify(vc))) as CredentialValidationResult
    } catch (e) {
      throw new Error('Error on fetching complianceCredential: ' + e)
    }
  }

  /**
   * Below are the helper functions for this agent. These are for inner functionality of the agent
   */

  private async acquireComplianceCredential(
    args: { verifiablePresentation: VerifiablePresentation },
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const complianceCredential = await this.submitComplianceCredential(
      {
        selfDescriptionVP: args.verifiablePresentation,
      },
      context
    )
    const hash: string = await context.agent.dataStoreSaveVerifiableCredential({
      verifiableCredential: complianceCredential,
    })
    return {
      verifiableCredential: complianceCredential,
      hash,
    }
  }

  public static getDateChallenge(): string {
    return new Date().toISOString().substring(0, 10)
  }

  private async onboardParticipantWithCredential(args: IOnboardParticipantWithCredentialArgs, context: GXRequiredContext) {
    const onboardingVP = await this.credentialHandler.issueVerifiablePresentation(
      {
        keyRef: args.keyRef,
        // purpose: args.purpose,
        verifiableCredentials: [args.complianceVC, args.selfDescriptionVC],
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.getDateChallenge(),
        verificationMethodId: args.verificationMethodId,
      },
      context
    )

    const apiType = extractApiTypeFromVC(args.selfDescriptionVC)
    const URL = `${this.getApiVersionedUrl()}/${apiType}/verify/raw?store=true`

    try {
      return (await postRequest(URL, JSON.stringify(onboardingVP))) as VerifiableCredential
    } catch (e) {
      throw new Error('Error on onboarding a complianceVC: ' + e)
    }
  }

  private async onboardParticipantWithCredentialIds(args: IOnboardParticipantWithCredentialIdsArgs, context: GXRequiredContext) {
    const complianceCredential = await context.agent.dataStoreGetVerifiableCredential({
      hash: args.complianceHash,
    })
    const selfDescribedVC = await context.agent.dataStoreGetVerifiableCredential({
      hash: args.selfDescriptionHash,
    })
    const did = (selfDescribedVC.credentialSubject as ICredentialSubject)['id'] as string
    const signatureInfo: ISignatureInfo = await extractSignatureInfo(did, context)
    return this.onboardParticipantWithCredential(
      {
        complianceVC: complianceCredential,
        selfDescriptionVC: selfDescribedVC,
        keyRef: signatureInfo.keyRef,
        purpose: signatureInfo.proofPurpose,
        verificationMethodId: signatureInfo.verificationMethodId,
        challenge: GaiaxComplianceClient.getDateChallenge(),
      },
      context
    )
  }

  private getApiVersionedUrl() {
    return getApiVersionedUrl(this.config)
  }
}
