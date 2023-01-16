import {
  CredentialPayload,
  DIDDocument,
  IAgentContext,
  ICredentialIssuer,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  IKeyManager,
  IPluginMethodMap,
  IResolver,
  IService,
  UniqueVerifiableCredential,
  UniqueVerifiablePresentation,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core'
import { ICredentialHandlerLDLocal } from '@sphereon/ssi-sdk-vc-handler-ld-local'
import { purposes } from '@digitalcredentials/jsonld-signatures'
import { _ExtendedIKey } from '@veramo/utils'

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

  exportDIDDocument({ domain, services }: { domain: string; services?: IService[] }, context: GXRequiredContext): Promise<DIDDocument>

  exportDIDToPath(
    { domain, services, path }: { domain: string; path?: string; services?: IService[] },
    context: GXRequiredContext
  ): Promise<ExportFileResult[]>

  issueVerifiableCredential(args: IIssueVerifiableCredentialArgs, context: GXRequiredContext): Promise<UniqueVerifiableCredential>

  issueVerifiablePresentation(args: IIssueVerifiablePresentationArgs, context: GXRequiredContext): Promise<UniqueVerifiablePresentation>

  checkVerifiableCredential(args: ICheckVerifiableCredentialArgs, context: GXRequiredContext): Promise<boolean>

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
  kmsName?: string
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
  domain?: string
  keyRef?: string

  persist?: boolean
}

export interface IIssueVerifiablePresentationArgs {
  challenge?: string
  keyRef?: string
  verifiableCredentials: VerifiableCredential[]
  domain?: string

  persist?: boolean
}

export interface ICheckVerifiablePresentationArgs {
  verifiablePresentation: VerifiablePresentation
  challenge?: string
}

export interface ICheckVerifiableCredentialArgs {
  verifiableCredential: VerifiableCredential
}

export interface IAcquireComplianceCredentialArgs {
  selfDescriptionVP: VerifiablePresentation
}

export interface IAcquireComplianceCredentialFromExistingParticipantArgs {
  participantSDId: string
}

export interface IOnboardParticipantWithCredentialArgs {
  domain?: string
  selfDescriptionVC: VerifiableCredential
  complianceVC: VerifiableCredential
  // purpose?: typeof purposes
  challenge?: string
  keyRef?: string
}

export interface IOnboardParticipantWithCredentialIdsArgs {
  selfDescriptionId: string
  complianceId: string
}

export interface IAcquireComplianceCredentialFromUnsignedParticipantArgs {
  credential: CredentialPayload
}

export interface IAddServiceOfferingUnsignedArgs {
  challenge?: string
  serviceOfferingCredential: CredentialPayload
  complianceId?: string
  complianceVC?: VerifiableCredential
  keyRef?: string
  domain?: string
}

export interface IAddServiceOfferingArgs {
  serviceOfferingVP: VerifiablePresentation
}

export interface IIssueAndSaveVerifiablePresentationArgs {
  challenge: string
  keyRef: string
  purpose?: typeof purposes
  verifiableCredentials: VerifiableCredential[]
  verificationMethodId: string
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

export interface ISignInfo {
  keyRef: string
  keys: _ExtendedIKey[]

  key: _ExtendedIKey
  participantDID: string
  participantDomain: string
  verificationRelationship: string
}

export interface IVerifySelfDescribedCredential {
  verifiableCredential?: VerifiableCredential
  id?: string
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

export interface ExportFileResult {
  file: string
  path: string
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
