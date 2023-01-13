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
import { IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types'
import { ICredentialHandlerLDLocal } from '@sphereon/ssi-sdk-vc-handler-ld-local'
import { purposes } from '@digitalcredentials/jsonld-signatures'

export interface IGaiaxComplianceClient extends IPluginMethodMap {
  acquireComplianceCredential(args: IAcquireComplianceCredentialArgs, context: GXRequiredContext): Promise<IVerifiableCredential>
  acquireComplianceCredentialFromExistingParticipant(
    args: IAcquireComplianceCredentialFromExistingParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse>
  acquireComplianceCredentialFromUnsignedParticipant(
    args: IAcquireComplianceCredentialFromUnsignedParticipantArgs,
    context: GXRequiredContext
  ): Promise<VerifiableCredentialResponse>
  addServiceOffering(args: IAddServiceOfferingArgs, context: GXRequiredContext): Promise<IGaiaxOnboardingResult>
  addServiceOfferingUnsigned(args: IAddServiceOfferingUnsignedArgs, context: GXRequiredContext): Promise<IGaiaxOnboardingResult>
  createDIDFromX509(args: IImportDIDArg, context: GXRequiredContext): Promise<IIdentifier>
  issueVerifiableCredential(args: IIssueVerifiableCredentialArgs, context: GXRequiredContext): Promise<IVerifiableCredential>
  issueVerifiablePresentation(args: IIssueVerifiablePresentationArgs, context: GXRequiredContext): Promise<IVerifiablePresentation>
  onboardParticipantWithCredential(args: IOnboardParticipantWithCredentialArgs, context: GXRequiredContext): Promise<IVerifiableCredential>
  onboardParticipantWithCredentialIds(args: IOnboardParticipantWithCredentialIdsArgs, context: GXRequiredContext): Promise<IVerifiableCredential>
  verifySelfDescribedCredential(args: IVerifySelfDescribedCredential, context: GXRequiredContext): Promise<CredentialValidationResult>
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

  //fixme: this is not a string, but a proofPurpose object
  purpose?: string
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

export interface IVerifySelfDescribedCredential {
  verifiableCredential?: IVerifiableCredential
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
