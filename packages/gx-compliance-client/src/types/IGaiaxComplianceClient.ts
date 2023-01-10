import {
  IAgentContext,
  ICredentialIssuer,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IPluginMethodMap,
  IResolver,
  W3CVerifiableCredential,
} from '@veramo/core'
import { ICredential, ICredentialSubject, IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types'
import { ICredentialHandlerLDLocal } from '@sphereon/ssi-sdk-vc-handler-ld-local'

export interface IGaiaxComplianceClient extends IPluginMethodMap {
  issueVerifiableCredential(args: IIssueVerifiableCredentialArgs, context: GXRequiredContext): Promise<IVerifiableCredential>
  issueVerifiablePresentation(args: IIssueVerifiablePresentationArgs, context: GXRequiredContext): Promise<IVerifiablePresentation>
  getComplianceCredential(args: IGetComplianceCredentialArgs, context: GXRequiredContext): Promise<IVerifiableCredential>
  acquireComplianceCredentialFromUnsignedParticipant(
    args: IAcquireComplianceCredentialFromUnsignedParticipantArgs,
    context: GXRequiredContext
  ): Promise<IVerifiableCredential>
  acquireComplianceCredentialFromExistingParticipant(args: IAcquireComplianceCredentialFromExistingParticipantArgs, context: GXRequiredContext): Promise<IVerifiableCredential>
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
  getComplianceCredential = 'getComplianceCredential',
  getComplianceCredentialFromUnsignedParticipant = 'getComplianceCredentialFromUnsignedParticipant',
  addServiceOfferingUnsigned = 'addServiceOfferingUnsigned',
  addServiceOffering = 'addServiceOffering',
}

export interface IGaiaxComplianceClientArgs {
  complianceServiceUrl: string
  complianceServiceVersion: string
  participantDid: string
  participantUrl: string
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
  unsignedCredential: ICredential
  // todo: ask Niels, not sure if we need this anymore
  purpose: string
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

export interface IGetComplianceCredentialArgs {
  selfDescribedVP: IVerifiablePresentation
}
export interface IAcquireComplianceCredentialFromExistingParticipantArgs {
  participantVChash: string;
  keyRef: string;
  purpose: string;
  challenge: string;
  verificationMethodId: string;
}

export interface IOnboardParticipantArgs {
  verificationMethodId: string
  selfDescribedVC: IVerifiableCredential
  complianceCredential: IVerifiableCredential
  purpose: string
  challenge?: string
  keyRef: string
}

export interface IAcquireComplianceCredentialFromUnsignedParticipantArgs {
  challenge?: string
  purpose: string
  verificationMethodId: string
  keyRef: string
  unsignedCredential: ICredential
}

export interface IAddServiceOfferingUnsignedArgs {
  challenge?: string
  unsignedCredential: ICredential
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
  vcHash: string
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
