import { IAgentContext, IDIDManager, IKey, IKeyManager, IPluginMethodMap, IResolver, W3CVerifiableCredential } from '@veramo/core'
import { ICredentialSubject, IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types'
import { OrPromise, RecordLike } from '@veramo/utils'
import { ContextDoc } from '@sphereon/ssi-sdk-vc-handler-ld-local/src/types/types'
import { SphereonLdSignature } from '@sphereon/ssi-sdk-vc-handler-ld-local/src/ld-suites'
import { IBindingOverrides } from '@sphereon/ssi-sdk-vc-handler-ld-local/src'
import { AbstractPrivateKeyStore } from '@veramo/key-manager'
import { ICredentialHandlerLDLocal } from '@sphereon/ssi-sdk-vc-handler-ld-local/src/types/ICredentialHandlerLDLocal'

export interface IGaiaxComplianceClient extends IPluginMethodMap {
  issueVerifiableCredential(args: IIssueVerifiableCredentialArgs, context: IRequiredContext): Promise<IVerifiableCredential>
  issueVerifiablePresentation(args: IIssueVerifiablePresentationArgs, context: IRequiredContext): Promise<IVerifiablePresentation>
  getComplianceCredential(args: IGetComplianceCredentialArgs, context: IRequiredContext): Promise<IVerifiableCredential>
  getComplianceCredentialFromUnsignedParticipant(
    args: IGetComplianceCredentialFromUnsignedParticipantArgs,
    context: IRequiredContext
  ): Promise<IVerifiableCredential>
  addServiceOfferingUnsigned(args: IAddServiceOfferingUnsignedArgs, context: IRequiredContext): Promise<IGaiaxOnboardingResult>
  addServiceOffering(args: IAddServiceOfferingArgs, context: IRequiredContext): Promise<IGaiaxOnboardingResult>
}

export interface IGaiaxComplianceClientArgs {
  complianceServiceUrl: string
  complianceServiceVersion: string
  participantDid: string
  participantUrl: string
  credentialHandlerOptions: {
    contextMaps: RecordLike<OrPromise<ContextDoc>>[]
    suites: SphereonLdSignature[]
    bindingOverrides?: IBindingOverrides
    keyStore?: AbstractPrivateKeyStore
  }
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
  customContext: string
  key: IKey
  purpose: string
  subject: ICredentialSubject
  type: IGaiaxCredentialType
  verificationMethodId: string
}

export interface IIssueVerifiablePresentationArgs {
  challenge?: string
  customContext: string
  key: IKey
  purpose: string
  verifiableCredentials: W3CVerifiableCredential[]
  verificationMethodId: string
}

export interface IGetComplianceCredentialArgs {
  selfDescribedVP: IVerifiablePresentation
}

export interface IGetComplianceCredentialFromUnsignedParticipantArgs {
  challenge?: string
  purpose: string
  verificationMethodId: string
  key: IKey
  customContext: string
  subject: ICredentialSubject
  type: IGaiaxCredentialType
}

export interface IAddServiceOfferingUnsignedArgs {
  challenge?: string
  customContext: string
  key: IKey
  purpose: string
  subject: ICredentialSubject
  type: IGaiaxCredentialType
  verificationMethodId: string
}

export interface IAddServiceOfferingArgs {
  serviceOfferingVP: IVerifiablePresentation
}

export type IRequiredContext = IAgentContext<IResolver & IKeyManager & IDIDManager & ICredentialHandlerLDLocal>
