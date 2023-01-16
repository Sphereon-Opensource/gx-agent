import { DIDDocument, IIdentifier, IService } from '@veramo/core'
import { ExportFileResult, GXRequiredContext, IImportDIDArg } from '../types'
import { privateKeyHexFromPEM, publicKeyHexFromPEM, x5cToPemCertChain } from '@sphereon/ssi-sdk-did-utils'
import { exportToDIDDocument } from '../utils/did-utils'
import fs from 'fs'

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
    const kidResult = kid ? kid : publicKeyHexFromPEM(privateKeyPEM)
    const controllerKeyId = kidResult //kid ? (kidResult.includes(domain) ? kidResult : `${domain}#${kid}`) : `${domain}#JWK2020-RSA`
    return await context.agent.didManagerImport({
      did: `did:web:${domain}`,
      provider: 'did:web',
      alias: domain,
      keys: [{ kid: kid ? kid : kidResult, privateKeyHex, type: 'RSA', meta, kms: kms ? kms : 'local' }],
      controllerKeyId,
    })
  }

  public static async exportDocument(
    { domain, services }: { domain: string; services?: IService[] },
    context: GXRequiredContext
  ): Promise<DIDDocument> {
    const id = await context.agent.didManagerGet({ did: `did:web:${domain}` })
    return await exportToDIDDocument(id, { services })
  }

  public static async exportToPath(
    { domain, services, path }: { domain: string; path?: string; services?: IService[] },
    context: GXRequiredContext
  ): Promise<ExportFileResult[]> {
    const id = await context.agent.didManagerGet({ did: `did:web:${domain}` })
    // we go through the agent from the context
    const doc = await context.agent.exportDIDDocument({ domain, services })

    const basePath = path ? `./${path.replace('.well-known', '')}/${domain}` : `./exported/${domain}`
    const exports: ExportFileResult[] = []
    const didPath = `${basePath}/.well-known/did.json`
    exports.push({ file: 'did.json', path: didPath })
    fs.mkdirSync(`${basePath}/.well-known`, { recursive: true })
    fs.writeFileSync(didPath, JSON.stringify(doc, null, 2))

    id.keys.forEach((key) => {
      if (key.type !== 'RSA') {
        return
      }
      if (key.meta?.x509?.x5u && key.meta?.x509?.x5c) {
        const x5cPath = `${basePath}/${key.meta.x509.x5u.replace(/https?:\/\/[^/]+\//, '')}`
        const file = x5cPath.split('\\').pop()!.split('/').pop()!
        fs.mkdirSync(x5cPath.replace(file, ''), { recursive: true })
        if (!file) {
          throw Error(`Could not deduce path for x5 ca chain from x5u URL ${key.meta.x509.x5u}`)
        }
        fs.writeFileSync(x5cPath, key.meta.certChainPEM ? key.meta.certChainPEM : x5cToPemCertChain(key.meta.x509.x5c))
        exports.push({ file, path: x5cPath })
      }
    })

    return exports
  }
}
