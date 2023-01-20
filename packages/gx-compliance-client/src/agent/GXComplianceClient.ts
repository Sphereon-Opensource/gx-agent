import { DIDDocument, IAgentPlugin, IIdentifier, IService, VerifiableCredential, VerifiablePresentation } from '@veramo/core'

import {
  asDID,
  AssertionProofPurpose,
  CredentialValidationResult,
  ExportFileResult,
  extractSubjectDIDFromVCs,
  GXRequiredContext,
  IAcquireComplianceCredentialFromExistingParticipantArgs,
  IGXComplianceClient,
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
import { extractApiTypeFromVC } from '../utils'
import { getApiVersionedUrl, postRequest } from '../utils'
import { extractSignInfo } from '../utils'

/**
 * {@inheritDoc IGXComplianceClient}
 */
export class GXComplianceClient implements IAgentPlugin {
  public readonly _config: IGaiaxComplianceConfig
  private readonly credentialHandler: CredentialHandler = new CredentialHandler(this)
  readonly schema = schema.IGaiaxComplianceClient

  constructor(config: IGaiaxComplianceConfig) {
    this._config = config
  }

  public client() {
    return this
  }

  public config() {
    return this.client()._config
  }

  readonly methods: IGXComplianceClient = {
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

  /** {@inheritDoc IGXComplianceClient.submitComplianceCredential} */
  private async submitComplianceCredential(args: IAcquireComplianceCredentialArgs, _context: GXRequiredContext): Promise<VerifiableCredential> {
    console.log(JSON.stringify(args.selfDescriptionVP, null, 2))
    try {
      return (await postRequest(this.getApiVersionedUrl() + '/compliance', JSON.stringify(args.selfDescriptionVP))) as VerifiableCredential
    } catch (e) {
      throw new Error('Error on fetching complianceVC: ' + e)
    }
  }

  /** {@inheritDoc IGXComplianceClient.acquireComplianceCredentialFromExistingParticipant} */
  private async acquireComplianceCredentialFromExistingParticipant(
    args: IAcquireComplianceCredentialFromExistingParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const selfDescribedVC = await context.agent.dataStoreGetVerifiableCredential({
      hash: args.participantSDId,
    })
    const did = (selfDescribedVC.credentialSubject as ICredentialSubject)['id'] as string

    const signInfo: ISignInfo = await extractSignInfo({ did, section: 'authentication' }, context)
    const uniqueVP = await this.credentialHandler.issueVerifiablePresentation(
      {
        keyRef: signInfo.keyRef,
        verifiableCredentials: [selfDescribedVC],
        challenge: GXComplianceClient.getDateChallenge(),
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

  /** {@inheritDoc IGXComplianceClient.acquireComplianceCredentialFromUnsignedParticipant} */
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
        challenge: GXComplianceClient.getDateChallenge(),
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

  /** {@inheritDoc IGXComplianceClient.createAndSubmitServiceOffering} */
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

    const did = asDID(args.domain ?? extractSubjectDIDFromVCs([complianceCredential]))
    const serviceOffering = await this.credentialHandler.issueVerifiableCredential(
      {
        domain: did,
        keyRef: args.keyRef,
        credential: args.serviceOfferingCredential,
        persist: true,
      },
      context
    )
    const serviceOfferingVP = await this.credentialHandler.issueVerifiablePresentation(
      {
        challenge: args.challenge ? args.challenge : GXComplianceClient.getDateChallenge(),
        keyRef: args.keyRef,
        // purpose: args.purpose,
        verifiableCredentials: [complianceCredential, serviceOffering.verifiableCredential],
        domain: did,
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

  /** {@inheritDoc IGXComplianceClient.submitServiceOffering} */
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

  /** {@inheritDoc IGXComplianceClient.createDIDFromX509} */
  private async createDIDFromX509(args: IImportDIDArg, context: GXRequiredContext): Promise<IIdentifier> {
    return DID.createDIDFromX509(
      {
        ...args,
        kms: args.kms ? args.kms : this._config.kmsName ? this._config.kmsName : 'local',
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

  /** {@inheritDoc IGXComplianceClient.verifyUnsignedSelfDescribedCredential} */
  private async verifySelfDescription(args: IVerifySelfDescribedCredential, context: GXRequiredContext): Promise<CredentialValidationResult> {
    if (!args.verifiableCredential && !args.id) {
      throw new Error('You should provide either vc id or vc itself')
    }

    const vc = args.verifiableCredential
      ? args.verifiableCredential
      : await context.agent.dataStoreGetVerifiableCredential({
          hash: args.id as string,
        })
    const valid = context.agent.verifyCredentialLDLocal({
      credential: vc,
      purpose: new AssertionProofPurpose(),
      fetchRemoteContexts: true,
    })
    if (!valid) {
      throw Error(`Invalid verifiable credential supplied`)
    }
    let url = this.getApiVersionedUrl()
    if ((vc.type as string[]).indexOf('ServiceOffering') != -1) {
      url = url + '/service-offering/validate/vc'
    } else if ((vc.type as string[]).indexOf('LegalPerson') != -1 || (vc.type as string[]).indexOf('NaturalPerson') != -1) {
      url = url + '/participant/validate/vc'
    }
    try {
      return (await postRequest(url, JSON.stringify(vc))) as CredentialValidationResult
    } catch (e: any) {
      throw new Error('Error on fetching complianceCredential: ' + e.message)
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
        challenge: args.challenge ? args.challenge : GXComplianceClient.getDateChallenge(),
        domain: asDID(args.domain ?? extractSubjectDIDFromVCs([args.selfDescriptionVC])),
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
        challenge: GXComplianceClient.getDateChallenge(),
      },
      context
    )
  }

  private getApiVersionedUrl() {
    return getApiVersionedUrl(this._config)
  }
}
