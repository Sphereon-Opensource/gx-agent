import {
  CredentialPayload,
  IAgentContext,
  ICredentialIssuer,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  IKeyManager,
  IPluginMethodMap,
  IResolver,
  W3CVerifiableCredential,
} from '@veramo/core'
import { ICredentialSubject, IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types'
import { ICredentialHandlerLDLocal } from '@sphereon/ssi-sdk-vc-handler-ld-local'

export interface IGaiaxComplianceClient extends IPluginMethodMap {
  createDIDFromX509(args: IImportDIDArg, context: GXRequiredContext): Promise<IIdentifier>

  issueVerifiableCredential(args: IIssueVerifiableCredentialArgs, context: GXRequiredContext): Promise<IVerifiableCredential>

  issueVerifiablePresentation(args: IIssueVerifiablePresentationArgs, context: GXRequiredContext): Promise<IVerifiablePresentation>

  acquireComplianceCredential(args: IAcquireComplianceCredentialArgs, context: GXRequiredContext): Promise<IVerifiableCredential>

  acquireComplianceCredentialFromUnsignedParticipant(
    args: IAcquireComplianceCredentialFromUnsignedParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse>
  acquireComplianceCredentialFromExistingParticipant(
    args: IAcquireComplianceCredentialFromExistingParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse>
  onboardParticipantWithCredential(args: IOnboardParticipantWithCredentialArgs, context: GXRequiredContext): Promise<IVerifiableCredential>
  onboardParticipantWithCredentialIds(args: IOnboardParticipantWithCredentialIdsArgs, context: GXRequiredContext): Promise<IVerifiableCredential>
  addServiceOfferingUnsigned(args: IAddServiceOfferingUnsignedArgs, context: GXRequiredContext): Promise<IGaiaxOnboardingResult>

  addServiceOffering(args: IAddServiceOfferingArgs, context: GXRequiredContext): Promise<IGaiaxOnboardingResult>
}

/**
 * Plugin method map interface
 * @public
 */
export enum MethodNames {
  issueVerifiableCredential = 'issueVerifiableCredential',
  issueVerifiablePresentation = 'issueVerifiablePresentation',
  acquireComplianceCredential = 'acquireComplianceCredential',
  acquireComplianceCredentialFromUnsignedParticipant = 'acquireComplianceCredentialFromUnsignedParticipant',
  acquireComplianceCredentialFromExistingParticipant = 'acquireComplianceCredentialFromExistingParticipant',
  onboardParticipantWithCredential = 'onboardParticipantWithCredential',
  onboardParticipantWithCredentialIds = 'onboardParticipantWithCredentialIds',
  addServiceOfferingUnsigned = 'addServiceOfferingUnsigned',
  addServiceOffering = 'addServiceOffering',
}

export interface IGaiaxComplianceClientArgs {
  defaultKms?: string
  complianceServiceUrl: string
  complianceServiceVersion: string
}

export interface IGaiaxConformityResult {
  conforms: boolean
  results: unknown[]
}

export interface IGaiaxOnboardingResult {
  conforms: boolean
  isValidSignature: boolean
  shape: IGaiaxConformityResult
  content: IGaiaxConformityResult
}

export interface IIssueCredentialArgs {}

export enum IGaiaxCredentialType {
  ServiceOffering = 'ServiceOffering',
  LegalPerson = 'LegalPerson',
  NaturalPerson = 'NaturalPerson',
}

export interface IIssueVerifiableCredentialArgs {
  credential: CredentialPayload
  // todo: ask Niels, not sure if we need this anymore
  purpose?: string
  verificationMethodId: string
  keyRef?: string
}

export interface IIssueVerifiableCredentialFromSubject {
  customContext: string
  keyRef?: string
  purpose: string
  subject: ICredentialSubject
  type: IGaiaxCredentialType
}

export interface IIssueVerifiablePresentationArgs {
  challenge?: string
  keyRef?: string
  purpose: string
  verifiableCredentials: W3CVerifiableCredential[]
  verificationMethodId: string
}

export interface IAcquireComplianceCredentialArgs {
  selfDescribedVP: IVerifiablePresentation
}

export interface IAcquireComplianceCredentialFromExistingParticipantArgs {
  participantSDHash: string
}

export interface IOnboardParticipantWithCredentialArgs {
  verificationMethodId: string
  selfDescribedVC: IVerifiableCredential
  complianceCredential: IVerifiableCredential
  purpose: string
  challenge?: string
  keyRef: string
}

export interface IOnboardParticipantWithCredentialIdsArgs {
  selfDescribedVcHash: string
  complianceCredentialHash: string
}

export interface IAcquireComplianceCredentialFromUnsignedParticipantArgs {
  credential: CredentialPayload
}

//fixme @nlklomp is this the right approach to handle complianceCredentialHash, complianceCredential
export interface IAddServiceOfferingUnsignedArgs {
  challenge?: string
  serviceOfferingCredential: CredentialPayload
  complianceCredentialHash?: string
  complianceCredential?: IVerifiableCredential
  keyRef: string
  purpose: string
  verificationMethodId: string
}

export interface IAddServiceOfferingArgs {
  serviceOfferingVP: IVerifiablePresentation
}

export interface IIssueAndSaveVerifiablePresentationArgs {
  challenge: string
  keyRef: string
  purpose: string
  verifiableCredentials: IVerifiableCredential[]
  verificationMethodId: string
}

export interface VerifiablePresentationResponse {
  verifiablePresentation: IVerifiablePresentation
  vpHash: string
}

export interface VerifiableCredentialResponse {
  verifiableCredential: IVerifiableCredential
  hash: string
}

export interface IImportDIDArg {
  domain: string
  privateKeyPEM: string
  certificatePEM: string
  certificateChainPEM: string
  certificateChainURL?: string
  kms?: string // The Key Management System to use. Will default to 'local' when not supplied.
  kid?: string // The requested KID. A default will be generated when not supplied
}

export interface ISignatureInfo {
  keyRef: string
  participantDid: string
  participantDomain: string
  proofPurpose: string
  verificationMethodId: string
}

export type GXPluginMethodMap = IResolver &
  IKeyManager &
  IDIDManager &
  ICredentialHandlerLDLocal &
  ICredentialIssuer &
  IGaiaxComplianceClient &
  IDataStore &
  IDataStoreORM

export type GXRequiredContext = IAgentContext<GXPluginMethodMap>

export interface JWK extends JsonWebKey {
  x5c?: string
  x5u?: string
}
