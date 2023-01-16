import { DIDDocument, IAgentPlugin, IIdentifier, IService, VerifiableCredential, VerifiablePresentation } from '@veramo/core'

import {
  AssertionProofPurpose,
  CredentialValidationResult,
  ExportFileResult,
  GXRequiredContext,
  IAcquireComplianceCredentialFromExistingParticipantArgs,
  IGaiaxComplianceClient,
  IImportDIDArg,
  IOnboardParticipantWithCredentialArgs,
  IOnboardParticipantWithCredentialIdsArgs,
  ISignInfo,
  IVerifySelfDescribedCredential,
  schema,
  VerifiableCredentialResponse,
} from '../index'

import {
  IAcquireComplianceCredentialArgs,
  IAcquireComplianceCredentialFromUnsignedParticipantArgs,
  IAddServiceOfferingArgs,
  IAddServiceOfferingUnsignedArgs,
  IGaiaxComplianceConfig,
  IGaiaxOnboardingResult,
} from '../types'
import { ICredentialSubject } from '@sphereon/ssi-types'
import { DID } from './DID'
import { CredentialHandler } from './CredentialHandler'
import { extractApiTypeFromVC } from '../utils/vc-extraction'
import { getApiVersionedUrl, postRequest } from '../utils/http'
import { extractSignInfo } from '../utils/did-utils'

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
    exportDIDDocument: this.exportDIDDocument.bind(this),
    exportDIDToPath: this.exportDIDToPath.bind(this),
    issueVerifiableCredential: this.credentialHandler.issueVerifiableCredential.bind(this),
    issueVerifiablePresentation: this.credentialHandler.issueVerifiablePresentation.bind(this),
    checkVerifiableCredential: this.credentialHandler.checkVerifiableCredential.bind(this),
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

    const signInfo: ISignInfo = await extractSignInfo({ did, section: 'authentication' }, context)
    const uniqueVP = await this.credentialHandler.issueVerifiablePresentation(
      {
        keyRef: signInfo.keyRef,
        verifiableCredentials: [selfDescribedVC],
        challenge: GaiaxComplianceClient.getDateChallenge(),
        domain: signInfo.participantDomain,
        persist: true,
      },
      context
    )
    return this.acquireComplianceCredential(
      {
        verifiablePresentation: uniqueVP.verifiablePresentation,
      },
      context
    )
  }

  /** {@inheritDoc IGaiaxComplianceClient.acquireComplianceCredentialFromUnsignedParticipant} */
  private async acquireComplianceCredentialFromUnsignedParticipant(
    args: IAcquireComplianceCredentialFromUnsignedParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const signInfo: ISignInfo = await extractSignInfo(
      {
        did: args.credential!.credentialSubject!.id as string,
        section: 'assertionMethod',
      },
      context
    )
    const selfDescription = await this.credentialHandler.issueVerifiableCredential(
      {
        credential: args.credential,
        domain: signInfo.participantDomain,
        keyRef: signInfo.keyRef,
        persist: true,
      },
      context
    )
    console.log(selfDescription.hash)
    const uniqueVP = await this.credentialHandler.issueVerifiablePresentation(
      {
        challenge: GaiaxComplianceClient.getDateChallenge(),
        keyRef: signInfo.keyRef,
        verifiableCredentials: [selfDescription.verifiableCredential],
        domain: signInfo.participantDomain,
      },
      context
    )
    const verifiableCredentialResponse = (await this.acquireComplianceCredential(
      {
        verifiablePresentation: uniqueVP.verifiablePresentation,
      },
      context
    )) as VerifiableCredentialResponse
    return verifiableCredentialResponse
  }

  /** {@inheritDoc IGaiaxComplianceClient.createAndSubmitServiceOffering} */
  private async createAndSubmitServiceOffering(args: IAddServiceOfferingUnsignedArgs, context: GXRequiredContext): Promise<IGaiaxOnboardingResult> {
    //TODO: implement fetching compliance VC from data storage
    if (!args.complianceId && !args.complianceVC) {
      throw new Error('You should provide either complianceId or complete complianceVC')
    }

    const complianceIsPersisted = args.complianceId
    const complianceCredential = complianceIsPersisted
      ? await context.agent.dataStoreGetVerifiableCredential({
          hash: args.complianceId!,
        })
      : args.complianceVC!

    const serviceOffering = await this.credentialHandler.issueVerifiableCredential(
      {
        keyRef: args.keyRef,
        credential: args.serviceOfferingCredential,
        persist: true,
      },
      context
    )
    const serviceOfferingVP = await this.credentialHandler.issueVerifiablePresentation(
      {
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.getDateChallenge(),
        keyRef: args.keyRef,
        // purpose: args.purpose,
        verifiableCredentials: [complianceCredential, serviceOffering.verifiableCredential],
        domain: args.domain,
        persist: true,
      },
      context
    )
    return await this.submitServiceOffering(
      {
        serviceOfferingVP: serviceOfferingVP.verifiablePresentation,
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
        kms: args.kms ? args.kms : this.config.kmsName ? this.config.kmsName : 'local',
      },
      context
    )
  }

  private async exportDIDDocument({ domain, services }: { domain: string; services?: IService[] }, context: GXRequiredContext): Promise<DIDDocument> {
    return DID.exportDocument({ domain, services }, context)
  }

  private async exportDIDToPath(
    { domain, services, path }: { domain: string; path?: string; services?: IService[] },
    context: GXRequiredContext
  ): Promise<ExportFileResult[]> {
    return DID.exportToPath({ domain, path, services }, context)
  }

  /** {@inheritDoc IGaiaxComplianceClient.verifyUnsignedSelfDescribedCredential} */
  private async verifySelfDescription(args: IVerifySelfDescribedCredential, context: GXRequiredContext): Promise<CredentialValidationResult> {
    //TODO: right now we're just signing and if there's no error, we're confirming the credential object, later we might want ot incorporate some validations from gx-compliance service itself or even make an api there (just for verification and not saving anything)
    if (!args.verifiableCredential && !!args.hash) {
      throw new Error('You should provide either vc hash or vc itself')
    }

    const vc = args.verifiableCredential
      ? args.verifiableCredential
      : await context.agent.dataStoreGetVerifiableCredential({
          hash: args.hash as string,
        })
    const valid = context.agent.verifyCredentialLDLocal({
      credential: vc,
      purpose: new AssertionProofPurpose(),
      fetchRemoteContexts: true,
    })
    if (!valid) {
      throw Error(`Invalid verifiable credential supplied`)
    }
    let address = this.getApiVersionedUrl()
    if ((vc.type as string[]).indexOf('ServiceOffering') != -1) {
      address = address + '/service-offering/validate/vc'
    } else if ((vc.type as string[]).indexOf('LegalPerson') != -1 || (vc.type as string[]).indexOf('NaturalPerson') != -1) {
      address = address + '/participant/validate/vc'
    }
    try {
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
        domain: args.domain,
        persist: true,
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
      hash: args.complianceId,
    })
    const selfDescriptionVC = await context.agent.dataStoreGetVerifiableCredential({
      hash: args.selfDescriptionId,
    })
    const did = (selfDescriptionVC.credentialSubject as ICredentialSubject)['id'] as string
    const signInfo: ISignInfo = await extractSignInfo({ did, section: 'authentication' }, context)
    return this.onboardParticipantWithCredential(
      {
        complianceVC: complianceCredential,
        selfDescriptionVC: selfDescriptionVC,
        keyRef: signInfo.keyRef,
        domain: signInfo.participantDomain,
        challenge: GaiaxComplianceClient.getDateChallenge(),
      },
      context
    )
  }

  private getApiVersionedUrl() {
    return getApiVersionedUrl(this.config)
  }
}
