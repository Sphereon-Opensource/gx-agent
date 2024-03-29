import { CredentialPayload, IAgentContext, IKey, IKeyManager, IResolver, PresentationPayload, TKeyType, VerifiableCredential } from '@veramo/core'
import { DIDDocument } from 'did-resolver/lib/resolver'

export type RequiredAgentMethods = IResolver & Pick<IKeyManager, 'keyManagerGet' | 'keyManagerSign'>

export abstract class SphereonLdSignature {
  // LinkedDataSignature Suites according to
  // https://github.com/digitalbazaar/jsonld-signatures/blob/main/lib/suites/LinkedDataSignature.js
  // Add type definition as soon as https://github.com/digitalbazaar/jsonld-signatures
  // supports those.

  abstract getSupportedVerificationType(): string

  abstract getSupportedVeramoKeyType(): TKeyType

  abstract getSuiteForSigning(key: IKey, issuerDid: string, verificationMethodId: string, context: IAgentContext<RequiredAgentMethods>): any

  abstract getContext(): string

  abstract getSuiteForVerification(): any

  abstract preDidResolutionModification(didUrl: string, didDoc: DIDDocument): void

  abstract preSigningCredModification(credential: CredentialPayload): void

  abstract preVerificationCredModification(credential: VerifiableCredential): void

  preSigningPresModification(presentation: PresentationPayload): void {
    // TODO: Remove invalid field 'verifiers' from Presentation. Needs to be adapted for LD verifiableCredentials
    // Only remove empty array (vc.signPresentation will throw then)
    const sanitizedPresentation = presentation as any
    if (sanitizedPresentation?.verifier?.length == 0) {
      delete sanitizedPresentation.verifier
    }
  }
}
