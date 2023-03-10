import { GXComplianceClient } from './GXComplianceClient.js'
import {
  ExportFileResult,
  GXRequiredContext,
  ICheckVerifiableCredentialArgs,
  ICheckVerifiablePresentationArgs,
  IIssueVerifiableCredentialArgs,
  IIssueVerifiablePresentationArgs,
} from '../types/index.js'
import { v4 as uuidv4 } from 'uuid'
import { UniqueVerifiableCredential, UniqueVerifiablePresentation, VerifiableCredential } from '@veramo/core'
import { asDID, convertDidWebToHost, extractSignInfo, extractSubjectDIDFromVCs, getVcType } from '../utils/index.js'
import fs from 'fs'
import { dirname } from 'path'
import { AuthenticationProofPurpose } from '@sphereon/ssi-sdk-vc-handler-ld-local/dist/types/types.js'

export class CredentialHandler {
  public readonly _client: GXComplianceClient

  constructor(client: GXComplianceClient) {
    this._client = client
  }

  private client() {
    return this._client
  }

  public config() {
    return this.client().config()
  }

  public async issueVerifiableCredential(args: IIssueVerifiableCredentialArgs, context: GXRequiredContext): Promise<UniqueVerifiableCredential> {
    const credential = args.credential
    if (!credential?.credentialSubject) {
      throw Error('Credential needs a subject')
    }
    if (!credential.credentialSubject?.id) {
      if (!args.domain) {
        throw Error('Either a credentialSubject.id value needs to be set, or a domain value needs to be supplied')
      }
      credential.credentialSubject.id = await asDID(args.domain)
    }
    const did = extractSubjectDIDFromVCs(credential)
    const signInfo = await extractSignInfo({ did, section: 'assertionMethod', keyRef: args.keyRef }, context)

    const verifiableCredential = await context.agent.createVerifiableCredentialLDLocal({
      credential: credential,
      keyRef: signInfo.keyRef,
      // todo: Purpose from signInfo
    })
    let hash = '' //todo: determine id, without saving
    if (args.persist) {
      hash = await context.agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
    }
    return { verifiableCredential, hash }
  }

  public async checkVerifiableCredential(args: ICheckVerifiableCredentialArgs, context: GXRequiredContext): Promise<boolean> {
    const result = await context.agent.verifyCredentialLDLocal({
      credential: args.verifiableCredential,
      fetchRemoteContexts: true,
    })
    return result
  }

  /** {@inheritDoc IGXComplianceClient.issueVerifiablePresentation} */
  public async issueVerifiablePresentation(
    args: IIssueVerifiablePresentationArgs,
    context: GXRequiredContext
  ): Promise<UniqueVerifiablePresentation> {
    const did = await asDID(args.domain!)
    const signInfo = await extractSignInfo({ did, section: 'authentication', keyRef: args.keyRef }, context)

    const verifiablePresentation = await context.agent.createVerifiablePresentationLDLocal({
      presentation: {
        id: `urn:uuid:${uuidv4()}`,
        issuanceDate: new Date(),
        type: ['VerifiablePresentation'],
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        verifiableCredential: args.verifiableCredentials,
        holder: did,
      },
      // purpose: args.purpose, // todo: Make dynamic based on signInfo and arg
      keyRef: signInfo.keyRef,
      challenge: args.challenge ? args.challenge : GXComplianceClient.getDateChallenge(),
      domain: args.targetUrl ?? this.config().complianceServiceUrl,
    })
    let hash = '' //todo: determine id, without saving
    if (args.persist) {
      hash = await context.agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation })
    }
    return { verifiablePresentation, hash }
  }

  public async checkVerifiablePresentation(args: ICheckVerifiablePresentationArgs, context: GXRequiredContext): Promise<boolean> {
    const domain = args.targetDomain ?? args.verifiablePresentation?.proof?.domain ?? this.config().complianceServiceUrl
    const challenge = args.challenge ?? args.verifiablePresentation?.proof?.challenge
    const result = await context.agent.verifyPresentationLDLocal({
      presentation: args.verifiablePresentation,
      challenge,
      domain,
      fetchRemoteContexts: true,
      presentationPurpose: new AuthenticationProofPurpose({ domain, challenge }),
    })
    if (args.show) {
      console.log(result)
    }
    return result
  }

  public async exportToPath(
    {
      domain,
      type,
      hash,
      exportPath,
      includeVCs,
      includeVPs,
    }: { domain: string; type?: string; hash?: string; exportPath?: string; includeVCs: boolean; includeVPs: boolean },
    context: GXRequiredContext
  ): Promise<ExportFileResult[]> {
    const did = await asDID(domain)
    const host = convertDidWebToHost(did)

    const basePath = (exportPath ? `./${exportPath.replace('.well-known', '')}/${host}` : `./exported/${host}`) + '/.well-known'
    const exports: ExportFileResult[] = []
    fs.mkdirSync(dirname(basePath), { recursive: true })

    function typeFilter(verifiableCredential: VerifiableCredential) {
      return getVcType(verifiableCredential) === type
    }

    if (includeVCs) {
      const vcs = (await context.agent.dataStoreORMGetVerifiableCredentials())
        .filter((uniquevc) => uniquevc.verifiableCredential.issuer === did || uniquevc.verifiableCredential.credentialSubject.id === did)
        .filter((uniquevc) => typeFilter(uniquevc.verifiableCredential))
        .filter((uniqueVc) => !hash || uniqueVc.hash === hash)

      vcs.forEach((key) => {
        let fileName =
          typeof key.verifiableCredential.type === 'string' || !key.verifiableCredential.type || key.verifiableCredential.type.length <= 1
            ? type
              ? `vc-${type}-${key.hash}`
              : `vc-${key.hash}`
            : 'vc-' + key.verifiableCredential.type!.find((t) => t !== 'VerifiableCredential') + '-' + key.hash
        if (!fileName) {
          type ? `vc-${type}-${key.hash}` : `vc-${key.hash}`
        }
        fileName += '.json'
        const path = `${basePath}/${fileName}`
        fs.mkdirSync(dirname(path), { recursive: true })
        fs.writeFileSync(path, JSON.stringify(key.verifiableCredential, null, 2))
        exports.push({ file: fileName, path: dirname(path) })
      })
    }
    if (includeVPs) {
      const vps = (await context.agent.dataStoreORMGetVerifiablePresentations())
        .filter((uniquevp) => uniquevp.verifiablePresentation.holder === did)
        .filter((uniquevp) => !type || uniquevp.verifiablePresentation.verifiableCredential?.some((vc) => typeFilter(vc as VerifiableCredential)))
        .filter((uniqueVp) => !hash || uniqueVp.hash === hash)

      vps.forEach((key) => {
        const file = type ? `vp-${type}-${key.hash}.json` : `vp-${key.hash}.json`
        const path = `${basePath}/${file}`
        fs.mkdirSync(dirname(path), { recursive: true })
        fs.writeFileSync(path, JSON.stringify(key.verifiablePresentation, null, 2))
        exports.push({ file, path: dirname(path) })
      })
    }

    return exports
  }
}
