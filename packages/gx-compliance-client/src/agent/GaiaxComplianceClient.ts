import { CredentialPayload, IAgentPlugin, IIdentifier, W3CVerifiableCredential } from '@veramo/core'

import {
  CredentialValidationResult,
  GXRequiredContext,
  IAcquireComplianceCredentialFromExistingParticipantArgs,
  IGaiaxComplianceClient,
  IGaiaxCredentialType,
  IImportDIDArg,
  IIssueAndSaveVerifiablePresentationArgs,
  IOnboardParticipantWithCredentialArgs,
  IOnboardParticipantWithCredentialIdsArgs,
  ISignatureInfo,
  IVerifySelfDescribedCredential,
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
import { ICredentialSubject, IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types'

import { VerifiableCredentialSP, VerifiablePresentationSP } from '@sphereon/ssi-sdk-core'

import { v4 as uuidv4 } from 'uuid'
import fetch from 'cross-fetch'
import { DID } from './DID'
import { InvalidArgumentError } from 'commander'

/**
 * {@inheritDoc IGaiaxComplianceClient}
 */
export class GaiaxComplianceClient implements IAgentPlugin {
  readonly schema = schema.IGaiaxComplianceClient
  readonly methods: IGaiaxComplianceClient = {
    acquireComplianceCredential: this.acquireComplianceCredential.bind(this),
    acquireComplianceCredentialFromExistingParticipant: this.acquireComplianceCredentialFromExistingParticipant.bind(this),
    acquireComplianceCredentialFromUnsignedParticipant: this.acquireComplianceCredentialFromUnsignedParticipant.bind(this),
    addServiceOffering: this.addServiceOffering.bind(this),
    addServiceOfferingUnsigned: this.addServiceOfferingUnsigned.bind(this),
    createDIDFromX509: this.createDIDFromX509.bind(this),
    issueVerifiableCredential: this.issueVerifiableCredential.bind(this),
    issueVerifiablePresentation: this.issueVerifiablePresentation.bind(this),
    onboardParticipantWithCredential: this.onboardParticipantWithCredential.bind(this),
    onboardParticipantWithCredentialIds: this.onboardParticipantWithCredentialIds.bind(this),
    verifySelfDescribedCredential: this.verifySelfDescribedCredential.bind(this),
  }
  private readonly complianceServiceUrl: string
  private readonly complianceServiceVersion: string
  private readonly defaultKMS?: string

  constructor(options: IGaiaxComplianceClientArgs) {
    this.defaultKMS = options.defaultKms
    this.complianceServiceUrl = options.complianceServiceUrl
    this.complianceServiceVersion = options.complianceServiceVersion // can be default v2206
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

  /** {@inheritDoc IGaiaxComplianceClient.acquireComplianceCredentialFromExistingParticipant} */
  private async acquireComplianceCredentialFromExistingParticipant(
    args: IAcquireComplianceCredentialFromExistingParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const selfDescribedVC = (await context.agent.dataStoreGetVerifiableCredential({
      hash: args.participantSDHash,
    })) as IVerifiableCredential
    const did = (selfDescribedVC.credentialSubject as ICredentialSubject)['id'] as string
    const signatureInfo: ISignatureInfo = await this.extractSignatureInfo(did, context)
    const verifiablePresentationResponse: VerifiablePresentationResponse = await this.issueAndSaveVerifiablePresentation(
      {
        keyRef: signatureInfo.keyRef,
        purpose: signatureInfo.proofPurpose,
        verifiableCredentials: [selfDescribedVC],
        challenge: GaiaxComplianceClient.getDateChallenge(),
        verificationMethodId: signatureInfo.verificationMethodId,
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

  /** {@inheritDoc IGaiaxComplianceClient.acquireComplianceCredentialFromUnsignedParticipant} */
  private async acquireComplianceCredentialFromUnsignedParticipant(
    args: IAcquireComplianceCredentialFromUnsignedParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse> {
    const signatureInfo: ISignatureInfo = await this.extractSignatureInfo(args.credential!.credentialSubject!.id as string, context)
    const selfDescribedVC: IVerifiableCredential = await this.issueVerifiableCredential(
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
    const verifiablePresentationResponse: VerifiablePresentationResponse = await this.issueAndSaveVerifiablePresentation(
      {
        challenge: GaiaxComplianceClient.getDateChallenge(),
        keyRef: signatureInfo.keyRef,
        purpose: signatureInfo.proofPurpose,
        verifiableCredentials: [selfDescribedVC as IVerifiableCredential],
        verificationMethodId: signatureInfo.verificationMethodId,
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
    if (!args.complianceCredentialHash && !args.complianceCredential) {
      throw new Error('You should provide either complianceCredentialHash or complete complianceCredential')
    }
    const complianceCredential: W3CVerifiableCredential = args.complianceCredentialHash
      ? ((await context.agent.dataStoreGetVerifiableCredential({
          hash: args.complianceCredentialHash,
        })) as W3CVerifiableCredential)
      : (args.complianceCredential! as W3CVerifiableCredential)
    const serviceOfferingVC: W3CVerifiableCredential = (await this.issueVerifiableCredential(
      {
        keyRef: args.keyRef,
        credential: args.serviceOfferingCredential,
        verificationMethodId: args.verificationMethodId,
      },
      context
    )) as W3CVerifiableCredential
    const serviceOfferingVP = await this.issueVerifiablePresentation(
      {
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.getDateChallenge(),
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

  /** {@inheritDoc IGaiaxComplianceClient.createDIDFromX509} */
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
      keyRef: args.keyRef,
    })
    return verifiableCredentialSP as IVerifiableCredential
  }

  /** {@inheritDoc IGaiaxComplianceClient.issueVerifiablePresentation} */
  private async issueVerifiablePresentation(args: IIssueVerifiablePresentationArgs, context: GXRequiredContext): Promise<IVerifiablePresentation> {
    const participantDid = GaiaxComplianceClient.extractParticipantDidFromVCs(args.verifiableCredentials)
    return (await context.agent.createVerifiablePresentationLDLocal({
      presentation: {
        id: uuidv4(),
        issuanceDate: new Date(),
        type: ['VerifiablePresentation'],
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        verifiableCredential: args.verifiableCredentials,
        holder: participantDid,
      },
      purpose: args.purpose,
      keyRef: args.keyRef,
      challenge: args.challenge ? args.challenge : GaiaxComplianceClient.getDateChallenge(),
      domain: this.complianceServiceUrl,
    })) as IVerifiablePresentation
  }

  /** {@inheritDoc IGaiaxComplianceClient.verifyUnsignedSelfDescribedCredential} */
  private async verifySelfDescribedCredential(args: IVerifySelfDescribedCredential, context: GXRequiredContext): Promise<CredentialValidationResult> {
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
      const signatureInfo: ISignatureInfo = await this.extractSignatureInfo(
        (args.verifiableCredential!.credentialSubject as ICredentialSubject)['id'] as string,
        context
      )
      await this.issueVerifiableCredential(
        {
          credential: vc as CredentialPayload,
          verificationMethodId: signatureInfo.verificationMethodId,
          keyRef: signatureInfo.keyRef,
        },
        context
      )
      return {
        conforms: true,
        content: {
          conforms: true,
          results: [],
        },
        shape: {
          results: [],
          conforms: true,
        },
      }
    } catch (e) {
      return {
        conforms: false,
        content: {
          conforms: false,
          results: [],
        },
        shape: {
          results: [],
          conforms: false,
        },
      }
    }
  }

  /**
   * Below are the helper functions for this agent. These are for inner functionality of the agent
   */

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

  private static convertDidWebToHost(did: string) {
    did = did.substring(8)
    did = did.replace(/:/g, '/')
    did = did.replace(/%/g, ':')
    return did
  }

  private static extractApiTypeFromVC(vc: IVerifiableCredential): string {
    const credentialType = vc['type'].find((el) => el !== 'VerifiableCredential')
    return credentialType === IGaiaxCredentialType.LegalPerson || IGaiaxCredentialType.NaturalPerson ? 'participant' : 'service-offering'
  }

  private static extractParticipantDidFromVCs(verifiableCredentials: W3CVerifiableCredential[]) {
    const credentialSubject = (verifiableCredentials[0] as IVerifiableCredential).credentialSubject
    let participantDid = ''
    if (Array.isArray(credentialSubject)) {
      const singleCredentialSubject = (credentialSubject as ICredentialSubject[]).filter((s) => !!s.id).pop()
      if (!credentialSubject) {
        throw new Error('No participant did provided')
      }
      participantDid = (singleCredentialSubject as ICredentialSubject)['id'] as string
    } else {
      participantDid = (credentialSubject as ICredentialSubject)['id'] as string
    }
    if (participantDid === '') {
      throw new Error("Participant did can't be extracted from received VerifiableCredentials")
    }
    return participantDid
  }

  private async extractSignatureInfo(did: string, context: GXRequiredContext): Promise<ISignatureInfo> {
    const didResolutionResult = await context.agent.resolveDid({ didUrl: did })
    if (!didResolutionResult.didDocument?.verificationMethod) {
      throw new InvalidArgumentError('There is no verification method')
    }
    const verificationMethodId = didResolutionResult.didDocument.verificationMethod[0].id as string
    const keyRef = (await context.agent.didManagerGet({ did })).keys[0].kid

    return {
      keyRef,
      participantDid: did,
      participantDomain: GaiaxComplianceClient.convertDidWebToHost(did),
      verificationMethodId,
      proofPurpose: 'assertionMethod',
    }
  }

  private getApiVersionedUrl() {
    return `${this.complianceServiceUrl}${this.complianceServiceVersion ? '/v' + this.complianceServiceVersion : ''}/api`
  }

  private static getDateChallenge(): string {
    return new Date().toISOString().substring(0, 10)
  }

  private async issueAndSaveVerifiablePresentation(
    args: IIssueAndSaveVerifiablePresentationArgs,
    context: GXRequiredContext
  ): Promise<VerifiablePresentationResponse> {
    const vp: IVerifiablePresentation = await this.issueVerifiablePresentation(
      {
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.getDateChallenge(),
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

  private async onboardParticipantWithCredential(args: IOnboardParticipantWithCredentialArgs, context: GXRequiredContext) {
    const onboardingVP = await this.issueVerifiablePresentation(
      {
        keyRef: args.keyRef,
        purpose: args.purpose,
        verifiableCredentials: [args.complianceCredential as W3CVerifiableCredential, args.selfDescribedVC as W3CVerifiableCredential],
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.getDateChallenge(),
        verificationMethodId: args.verificationMethodId,
      },
      context
    )

    const apiType = GaiaxComplianceClient.extractApiTypeFromVC(args.selfDescribedVC)
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
    const selfDescribedVC: IVerifiableCredential = (await context.agent.dataStoreGetVerifiableCredential({
      hash: args.selfDescribedVcHash,
    })) as IVerifiableCredential
    const did = (selfDescribedVC.credentialSubject as ICredentialSubject)['id'] as string
    const signatureInfo: ISignatureInfo = await this.extractSignatureInfo(did, context)
    return this.onboardParticipantWithCredential(
      {
        complianceCredential: complianceCredential,
        selfDescribedVC: selfDescribedVC,
        keyRef: signatureInfo.keyRef,
        purpose: signatureInfo.proofPurpose,
        verificationMethodId: signatureInfo.verificationMethodId,
        challenge: GaiaxComplianceClient.getDateChallenge(),
      },
      context
    )
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
}
