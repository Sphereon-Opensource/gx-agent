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
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core'
import { ICredentialHandlerLDLocal } from '@sphereon/ssi-sdk-vc-handler-ld-local'
import { purposes } from '@digitalcredentials/jsonld-signatures'

export interface IGaiaxComplianceClient extends IPluginMethodMap {
  submitComplianceCredential(args: IAcquireComplianceCredentialArgs, context: GXRequiredContext): Promise<VerifiableCredential>

  acquireComplianceCredentialFromExistingParticipant(
    args: IAcquireComplianceCredentialFromExistingParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse>

  acquireComplianceCredentialFromUnsignedParticipant(
    args: IAcquireComplianceCredentialFromUnsignedParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse>

  submitServiceOffering(args: IAddServiceOfferingArgs, context: GXRequiredContext): Promise<IGaiaxOnboardingResult>

  createAndSubmitServiceOffering(args: IAddServiceOfferingUnsignedArgs, context: GXRequiredContext): Promise<IGaiaxOnboardingResult>

  createDIDFromX509(args: IImportDIDArg, context: GXRequiredContext): Promise<IIdentifier>

  issueVerifiableCredential(args: IIssueVerifiableCredentialArgs, context: GXRequiredContext): Promise<VerifiableCredential>

  issueVerifiablePresentation(args: IIssueVerifiablePresentationArgs, context: GXRequiredContext): Promise<VerifiablePresentation>

  checkVerifiablePresentation(args: ICheckVerifiablePresentationArgs, context: GXRequiredContext): Promise<boolean>

  onboardParticipantWithCredential(args: IOnboardParticipantWithCredentialArgs, context: GXRequiredContext): Promise<VerifiableCredential>

  onboardParticipantWithCredentialIds(args: IOnboardParticipantWithCredentialIdsArgs, context: GXRequiredContext): Promise<VerifiableCredential>

  verifySelfDescription(args: IVerifySelfDescribedCredential, context: GXRequiredContext): Promise<CredentialValidationResult>
}

/**
 * Plugin method map interface
 * @public
 */
export enum MethodNames {
  acquireComplianceCredential = 'acquireComplianceCredential',
  acquireComplianceCredentialFromUnsignedParticipant = 'acquireComplianceCredentialFromUnsignedParticipant',
  acquireComplianceCredentialFromExistingParticipant = 'acquireComplianceCredentialFromExistingParticipant',
  addServiceOfferingUnsigned = 'addServiceOfferingUnsigned',
  addServiceOffering = 'addServiceOffering',
  createDIDFromX509 = 'createDIDFromX509',
  issueVerifiableCredential = 'issueVerifiableCredential',
  issueVerifiablePresentation = 'issueVerifiablePresentation',
  onboardParticipantWithCredential = 'onboardParticipantWithCredential',
  onboardParticipantWithCredentialIds = 'onboardParticipantWithCredentialIds',
  verifyUnsignedSelfDescribedCredential = 'verifyUnsignedSelfDescribedCredential',
}

export interface IGaiaxComplianceConfig {
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

export enum IGaiaxCredentialType {
  ServiceOffering = 'ServiceOffering',
  LegalPerson = 'LegalPerson',
  NaturalPerson = 'NaturalPerson',
}

export interface IIssueVerifiableCredentialArgs {
  credential: CredentialPayload
  verificationMethodId: string
  keyRef?: string
}

export interface IIssueVerifiablePresentationArgs {
  challenge?: string
  keyRef?: string

  purpose?: typeof purposes
  verifiableCredentials: VerifiableCredential[]
  verificationMethodId: string
}

export interface ICheckVerifiablePresentationArgs {
  verifiablePresentation: VerifiablePresentation
  challenge?: string
}

export interface IAcquireComplianceCredentialArgs {
  selfDescriptionVP: VerifiablePresentation
}

export interface IAcquireComplianceCredentialFromExistingParticipantArgs {
  participantSDHash: string
}

export interface IOnboardParticipantWithCredentialArgs {
  verificationMethodId: string
  selfDescriptionVC: VerifiableCredential
  complianceVC: VerifiableCredential
  purpose: string
  challenge?: string
  keyRef: string
}

export interface IOnboardParticipantWithCredentialIdsArgs {
  selfDescriptionHash: string
  complianceHash: string
}

export interface IAcquireComplianceCredentialFromUnsignedParticipantArgs {
  credential: CredentialPayload
}

//fixme @nlklomp is this the right approach to handle complianceHash, complianceVC
export interface IAddServiceOfferingUnsignedArgs {
  challenge?: string
  serviceOfferingCredential: CredentialPayload
  complianceHash?: string
  complianceVC?: VerifiableCredential
  keyRef: string
  purpose: string
  verificationMethodId: string
}

export interface IAddServiceOfferingArgs {
  serviceOfferingVP: VerifiablePresentation
}

export interface IIssueAndSaveVerifiablePresentationArgs {
  challenge: string
  keyRef: string
  purpose: string
  verifiableCredentials: VerifiableCredential[]
  verificationMethodId: string
}

export interface VerifiablePresentationResponse {
  verifiablePresentation: VerifiablePresentation
  vpHash: string
}

export interface VerifiableCredentialResponse {
  verifiableCredential: VerifiableCredential
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

export interface IVerifySelfDescribedCredential {
  verifiableCredential?: VerifiableCredential
  hash?: string
}

export interface CredentialValidationResult {
  /**
   * The data conforms with the given rules and shape and has a valid signature
   */
  conforms: boolean

  /**
   * The SHACL Shape validation results
   */
  shape: ValidationResult

  /**
   * Content validation results
   */
  content: ValidationResult
}

export interface ValidationResult {
  /**
   * The data conforms with the given rules or shape
   */
  conforms: boolean

  /**
   * Error messages
   */
  results: string[]
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

export const ProofPurpose = purposes.ProofPurpose
export const ControllerProofPurpose = purposes.ControllerProofPurpose
export const AssertionProofPurpose = purposes.AssertionProofPurpose
export const AuthenticationProofPurpose = purposes.AuthenticationProofPurpose
