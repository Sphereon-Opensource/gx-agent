import { privateKeyHexFromPEM } from '@sphereon/ssi-sdk-bls-kms-local'
import { IIdentifier } from '@veramo/core'
import { GXRequiredContext, IImportDIDArg } from '../types'

export class DID {
  public static async createDIDFromX509(
    { domain, privateKeyPEM, certificatePEM, certificateChainPEM, certificateChainURL, kms, kid }: IImportDIDArg,
    context: GXRequiredContext
  ): Promise<IIdentifier> {
    const x509 = {
      cn: domain,
      certificatePEM,
      certificateChainPEM,
      privateKeyPEM,
      certificateChainURL,
    }
    const privateKeyHex = privateKeyHexFromPEM(privateKeyPEM)
    const meta = { x509 }
    const kidResult = kid ? kid : `${domain}#JWK2020-RSA`
    const controllerKeyId = kidResult //kid ? (kidResult.includes(domain) ? kidResult : `${domain}#${kid}`) : `${domain}#JWK2020-RSA`
    return await context.agent.didManagerImport({
      did: `did:web:${domain}`,
      provider: 'did:web',
      alias: domain,
      keys: [{ kid: kid ? kid : kidResult, privateKeyHex, type: 'RSA', meta, kms: kms ? kms : 'local' }],
      controllerKeyId,
    })
  }
}
