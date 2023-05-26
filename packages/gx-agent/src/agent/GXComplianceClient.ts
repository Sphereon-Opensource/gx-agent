import {
  DIDDocument,
  IAgentPlugin,
  IIdentifier,
  IService,
  VerifiableCredential,
  VerifiablePresentation,
  UniqueVerifiablePresentation,
} from '@veramo/core'

import {
  CredentialValidationResult,
  ExportFileResult,
  getIssuerString,
  GXRequiredContext,
  IAcquireComplianceCredentialFromExistingParticipantArgs,
  IGXComplianceClient,
  IImportDIDArg,
  IOnboardParticipantOnEcosystem,
  IOnboardParticipantWithCredentialArgs,
  IOnboardParticipantWithCredentialIdsArgs,
  IOnboardServiceOfferingOnEcosystemArgs,
  ISignInfo,
  IVerifySelfDescribedCredential,
  VerifiableCredentialResponse,
} from '../index.js'

import {
  IAcquireComplianceCredentialArgs,
  IAcquireComplianceCredentialFromUnsignedParticipantArgs,
  IAddServiceOfferingArgs,
  IAddServiceOfferingUnsignedArgs,
  IGaiaxComplianceConfig,
  IGaiaxOnboardingResult,
} from '../types/index.js'
import { ICredentialSubject } from '@sphereon/ssi-types'
import { DID } from './DID.js'
import { CredentialHandler } from './CredentialHandler.js'
import { extractApiTypeFromVC } from '../utils/index.js'
import { getApiVersionedUrl, postRequest } from '../utils/index.js'
import { extractSignInfo } from '../utils/index.js'

/**
 * {@inheritDoc IGXComplianceClient}
 */
export class GXComplianceClient implements IAgentPlugin {
  public readonly _config: IGaiaxComplianceConfig
  private readonly credentialHandler: CredentialHandler = new CredentialHandler(this)
  // readonly schema = schema.IGaiaxComplianceClient

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
    exportVCsToPath: this.credentialHandler.exportToPath.bind(this),
    onboardParticipantOnEcosystem: this.onboardParticipantOnEcosystem.bind(this),
    onboardParticipantWithCredential: this.onboardParticipantWithCredential.bind(this),
    onboardParticipantWithCredentialIds: this.onboardParticipantWithCredentialIds.bind(this),
    onboardServiceOfferingOnEcosystem: this.onboardServiceOfferingOnEcosystem.bind(this),
    verifySelfDescription: this.verifySelfDescription.bind(this),
  }

  /** {@inheritDoc IGXComplianceClient.submitComplianceCredential} */
  private async submitComplianceCredential(args: IAcquireComplianceCredentialArgs, _context: GXRequiredContext): Promise<VerifiableCredential> {
    if (args.show) {
      console.log(JSON.stringify(args.selfDescriptionVP, null, 2))
    }
    try {
      return (await postRequest(
        this.getApiVersionedUrl(args.baseUrl) + '/compliance',
        JSON.stringify(args.selfDescriptionVP)
      )) as VerifiableCredential
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
        persist: args.persist,
      },
      context
    )
    return this.acquireComplianceCredential(
      {
        verifiablePresentation: uniqueVP.verifiablePresentation,
        baseUrl: this._config.complianceServiceUrl,
        show: args.show,
      },
      context
    )
  }

  /** {@inheritDoc IGXComplianceClient.acquireComplianceCredentialFromUnsignedParticipant} */
  private async acquireComplianceCredentialFromUnsignedParticipant(
    args: IAcquireComplianceCredentialFromUnsignedParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const did = args.credential!.credentialSubject!.id
      ? (args.credential!.credentialSubject!.id as string)
      : args.credential!.credentialSubject!['@id']
    if (!did) {
      throw new Error(`Can't find the did in the credentialSubject.`)
    }
    const signInfo: ISignInfo = await extractSignInfo(
      {
        did,
        section: 'assertionMethod',
      },
      context
    )
    const selfDescription = await this.credentialHandler.issueVerifiableCredential(
      {
        credential: args.credential,
        keyRef: signInfo.keyRef,
        persist: true,
      },
      context
    )
    const uniqueVP = await this.credentialHandler.issueVerifiablePresentation(
      {
        keyRef: signInfo.keyRef,
        verifiableCredentials: [selfDescription.verifiableCredential],
        persist: args.persist,
      },
      context
    )
    const verifiableCredentialResponse = (await this.acquireComplianceCredential(
      {
        verifiablePresentation: uniqueVP.verifiablePresentation,
        baseUrl: this._config.complianceServiceUrl,
        show: args.show,
      },
      context
    )) as VerifiableCredentialResponse
    return verifiableCredentialResponse
  }

  /** {@inheritDoc IGXComplianceClient.createAndSubmitServiceOffering} */
  private async createAndSubmitServiceOffering(
    args: IAddServiceOfferingUnsignedArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const participantVC = await context.agent.dataStoreGetVerifiableCredential({
      hash: args.participantId,
    })
    const complianceVC = await context.agent.dataStoreGetVerifiableCredential({
      hash: args.complianceId,
    })
    const serviceOfferingVC = await context.agent.dataStoreGetVerifiableCredential({
      hash: args.serviceOfferingId,
    })
    const did = complianceVC.credentialSubject.id ? complianceVC.credentialSubject.id : getIssuerString(participantVC)
    const labelVCs = args.labelVCs
    const signInfo: ISignInfo = await extractSignInfo({ did, section: 'authentication' }, context)
    const serviceOfferingVP = await this.credentialHandler.issueVerifiablePresentation(
      {
        keyRef: signInfo.keyRef,
        // purpose: args.purpose,
        verifiableCredentials: [serviceOfferingVC, complianceVC, participantVC, ...(labelVCs ? labelVCs : [])],
        persist: args.persist,
      },
      context
    )
    return await this.acquireComplianceCredential(
      {
        verifiablePresentation: serviceOfferingVP.verifiablePresentation,
        baseUrl: this._config.complianceServiceUrl,
        show: args.show,
      },
      context
    )
  }

  /** {@inheritDoc IGXComplianceClient.submitServiceOffering} */
  private async submitServiceOffering(args: IAddServiceOfferingArgs, _context: GXRequiredContext): Promise<IGaiaxOnboardingResult> {
    try {
      return (await postRequest(
        this.getApiVersionedUrl(args.baseUrl) + '/service-offering/verify/raw',
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

    let valid = false
    const vc = args.verifiableCredential
      ? args.verifiableCredential
      : await context.agent.dataStoreGetVerifiableCredential({
          hash: args.id as string,
        })
    try {
      valid = await context.agent.verifyCredentialLDLocal({
        credential: vc,
        fetchRemoteContexts: true,
      })

      if (!valid) {
        throw Error(`Invalid verifiable credential supplied`)
      }
    } catch (e: any) {
      console.error(e.message)
    }
    console.log('Agent validation of the self-description. Valid: ' + valid)

    let url = this.getApiVersionedUrl()
    if (vc.type!.includes('LegalPerson') || vc.type!.includes('NaturalPerson')) {
      url = url + '/participant/validate/vc'
    } else if (vc.credentialSubject['@type']?.includes('LegalPerson')) {
      url = url + '/participant/validate/vc'
    } else {
      url = url + '/service-offering/validate/vc'
    }

    if (args.show) {
      console.log(JSON.stringify(vc, null, 2))
    }

    try {
      return (await postRequest(url, JSON.stringify(vc))) as CredentialValidationResult
    } catch (e: any) {
      console.error('Error on fetching complianceCredential: ' + e.message)
      process.exit(1)
    }
  }

  /**
   * Below are the helper functions for this agent. These are for inner functionality of the agent
   */

  private async acquireComplianceCredential(
    args: {
      show?: boolean
      baseUrl: string
      verifiablePresentation: VerifiablePresentation
    },
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const complianceCredential = await this.submitComplianceCredential(
      {
        selfDescriptionVP: args.verifiablePresentation,
        baseUrl: args.baseUrl,
        show: args.show,
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

  private async onboardParticipantOnEcosystem(
    args: IOnboardParticipantOnEcosystem,
    context: GXRequiredContext
  ): Promise<UniqueVerifiablePresentation> {
    const uniqueVP = await this.credentialHandler.issueVerifiablePresentation(
      {
        challenge: args.challenge,
        keyRef: args.keyRef,
        verifiableCredentials: [args.selfDescriptionVC, args.complianceVC],
        persist: args.persist,
      },
      context
    )
    const verifiableCredentialResponse = (await this.acquireComplianceCredential(
      {
        verifiablePresentation: uniqueVP.verifiablePresentation,
        baseUrl: args.ecosystemUrl,
        show: args.show,
      },
      context
    )) as VerifiableCredentialResponse
    const onboardingVP = await this.credentialHandler.issueVerifiablePresentation(
      {
        keyRef: args.keyRef,
        verifiableCredentials: [verifiableCredentialResponse.verifiableCredential, args.complianceVC, args.selfDescriptionVC],
        challenge: args.challenge,
        persist: args.persist,
      },
      context
    )

    const apiType = extractApiTypeFromVC(args.selfDescriptionVC)
    await this.onboardParticipantWithVerifiablePresentation({ vp: onboardingVP.verifiablePresentation, baseUrl: args.ecosystemUrl, apiType }, context)
    return onboardingVP
  }

  private async onboardParticipantWithCredential(args: IOnboardParticipantWithCredentialArgs, context: GXRequiredContext) {
    if (!args.selfDescriptionVC) {
      throw Error('Please provide the participant self-description')
    } else if (!args.complianceVC) {
      throw Error('Please provide the Gaia-X compliance credential')
    }
    const onboardingVP = await this.credentialHandler.issueVerifiablePresentation(
      {
        keyRef: args.keyRef,
        verifiableCredentials: [args.complianceVC, args.selfDescriptionVC],
        challenge: args.challenge,
        persist: args.persist,
      },
      context
    )
    const apiType = extractApiTypeFromVC(args.selfDescriptionVC)
    return this.onboardParticipantWithVerifiablePresentation(
      {
        vp: onboardingVP.verifiablePresentation,
        apiType,
        baseUrl: args.baseUrl,
      },
      context
    )
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
        persist: args.persist,
      },
      context
    )
  }

  private async onboardParticipantWithVerifiablePresentation(
    args: { vp: VerifiablePresentation; apiType: string; baseUrl?: string },
    _context: GXRequiredContext
  ) {
    const URL = `${this.getApiVersionedUrl(args.baseUrl)}/${args.apiType}/verify/raw?store=false`

    try {
      return (await postRequest(URL, JSON.stringify(args.vp))) as VerifiableCredential
    } catch (e) {
      throw new Error('Error on onboarding a complianceVC: ' + e)
    }
  }

  private async onboardServiceOfferingOnEcosystem(
    args: IOnboardServiceOfferingOnEcosystemArgs,
    context: GXRequiredContext
  ): Promise<IGaiaxOnboardingResult> {
    const selfDescribedVC = await context.agent.dataStoreGetVerifiableCredential({
      hash: args.sdId,
    })
    const complianceVC = await context.agent.dataStoreGetVerifiableCredential({
      hash: args.complianceId,
    })
    const ecosystemComplianceVC = await context.agent.dataStoreGetVerifiableCredential({
      hash: args.ecosystemComplianceId,
    })
    const signInfo: ISignInfo = await extractSignInfo({ did: getIssuerString(selfDescribedVC), section: 'authentication' }, context)
    const labelVCs = args.labelVCs
    const uniqueVpCompliance = await this.credentialHandler.issueVerifiablePresentation(
      {
        keyRef: signInfo.keyRef,
        verifiableCredentials: [args.serviceOffering, ecosystemComplianceVC, complianceVC, selfDescribedVC, ...(labelVCs ? labelVCs : [])],
        persist: args.persist ? args.persist : false,
      },
      context
    )
    if (args.show) {
      console.log(`serviceOffering VP: ${JSON.stringify(uniqueVpCompliance, null, 2)}`)
    }
    const vcSoComplianceResponse = await this.acquireComplianceCredential(
      { show: args.show, baseUrl: args.ecosystemUrl, verifiablePresentation: uniqueVpCompliance.verifiablePresentation },
      context
    )
    if (args.show) {
      console.log(`VerifiableCredential ServiceOffering Compliance response: ${JSON.stringify(vcSoComplianceResponse, null, 2)}`)
    }
    const uniqueVpOnboard = await this.credentialHandler.issueVerifiablePresentation(
      {
        keyRef: signInfo.keyRef,
        verifiableCredentials: [
          args.serviceOffering,
          ecosystemComplianceVC,
          complianceVC,
          selfDescribedVC,
          vcSoComplianceResponse.verifiableCredential,
          ...(labelVCs ? labelVCs : []),
        ],
        persist: args.persist ? args.persist : false,
      },
      context
    )
    if (args.show) {
      console.log(`serviceOffering VP (with compliance): ${JSON.stringify(uniqueVpOnboard, null, 2)}`)
    }
    return await this.submitServiceOffering(
      {
        serviceOfferingVP: uniqueVpOnboard.verifiablePresentation,
        baseUrl: args.ecosystemUrl,
      },
      context
    )
  }

  private getApiVersionedUrl(baseUrl?: string) {
    return getApiVersionedUrl(this._config, baseUrl)
  }
}
