import { SphereonLdSignature } from '@sphereon/ssi-sdk.vc-handler-ld-local/dist/ld-suites'
import { CredentialPayload, DIDDocument, IAgentContext, IKey, PresentationPayload, TKeyType, VerifiableCredential } from '@veramo/core'
import { RequiredAgentMethods } from '@sphereon/ssi-sdk.vc-handler-ld-local'
import * as u8a from 'uint8arrays'
import { encodeJoseBlob } from '@veramo/utils'
import { JsonWebKey } from './gx-impl/JsonWebKeyWithRSASupport.js'
import { JsonWebSignature } from './gx-impl/JsonWebSignatureWithRSASupport.js'

/**
 * WARNING:
 *
 * This suite is made specifically to be interoperable with Gaia-X. Do not use this suite for other purposes, as the current Gaia-X implementation contains multiple errors and does not conform to JsonWebSignature2020.
 * If you do need regular JsonWebSignature2020 support, please configure the SphereonWebSignature2020 class when setting up the agent
 */
export class GXJsonWebSignature2020 extends SphereonLdSignature {
  getSupportedVerificationType(): 'JsonWebKey2020' {
    return 'JsonWebKey2020'
  }

  getSupportedVeramoKeyType(): TKeyType {
    return 'RSA'
  }

  async getSuiteForSigning(key: IKey, issuerDid: string, verificationMethodId: string, context: IAgentContext<RequiredAgentMethods>): Promise<any> {
    const controller = issuerDid

    // DID Key ID
    let id = verificationMethodId

    const alg = 'PS256'
    const signer = {
      // returns a JWS detached
      sign: async (args: { data: string }): Promise<string> => {
        const header = {
          alg,
          b64: false,
          crit: ['b64'],
        }

        const headerString = encodeJoseBlob(header)
        const dataBuffer = u8a.fromString(args.data, 'utf-8')

        const messageBuffer = u8a.concat([u8a.fromString(`${headerString}.`, 'utf-8'), dataBuffer])
        const messageString = u8a.toString(messageBuffer, 'base64') //will be decoded to bytes in the keyManagerSign, hence the base64 arg to the method below

        const signature = await context.agent.keyManagerSign({
          keyRef: key.kid,
          algorithm: alg,
          data: messageString,
          encoding: 'base64',
        }) // returns base64url signature
        return `${headerString}..${signature}`
      },
    }

    const publicKeyJwk = key.meta?.publicKeyJwk
      ? key.meta.publicKeyJwk
      : {
          kty: 'OKP',
          crv: 'Ed25519',
          x: u8a.toString(u8a.fromString(key.publicKeyHex, 'hex'), 'base64url'),
        }

    const verificationKey = await JsonWebKey.from(
      {
        id: id,
        type: this.getSupportedVerificationType(),
        controller: controller,
        publicKeyJwk,
      },
      { signer, verifier: false }
    )

    // verificationKey.signer = () => signer

    const suite = new JsonWebSignature({
      key: verificationKey,
    })

    return suite
  }

  getSuiteForVerification(): any {
    const verifier = {
      // returns a JWS detached
      verify: async (args: { data: Uint8Array; signature: Uint8Array }): Promise<boolean> => {
        return true
      },
    }
    return new JsonWebSignature({ verifier })
  }

  preSigningCredModification(credential: CredentialPayload): void {
    // do nothing
  }

  preSigningPresModification(presentation: PresentationPayload): void {
    // do nothing
  }

  preDidResolutionModification(didUrl: string, didDoc: DIDDocument): void {
    // do nothing
  }

  getContext(): string {
    return 'https://w3id.org/security/suites/jws-2020/v1'
  }

  preVerificationCredModification(credential: VerifiableCredential): void {
    // do nothing
  }
}
