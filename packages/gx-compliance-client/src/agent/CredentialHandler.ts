import { GaiaxComplianceClient } from './GaiaxComplianceClient'
import {
  AuthenticationProofPurpose,
  GXRequiredContext,
  ICheckVerifiableCredentialArgs,
  ICheckVerifiablePresentationArgs,
  IGaiaxComplianceConfig,
  IIssueAndSaveVerifiablePresentationArgs,
  IIssueVerifiableCredentialArgs,
  IIssueVerifiablePresentationArgs,
  VerifiablePresentationResponse,
} from '../types'
import { v4 as uuidv4 } from 'uuid'
import { UniqueVerifiableCredential, VerifiablePresentation } from '@veramo/core'
import { extractSignInfo, extractSubjectDIDFromVCs } from '../utils'
import { VerifiablePresentationSP } from '@sphereon/ssi-sdk-core'

export class CredentialHandler {
  public readonly config: IGaiaxComplianceConfig

  constructor(client: GaiaxComplianceClient) {
    this.config = client.config
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
      credential.credentialSubject.id = `did:web:${args.domain}`
    }
    const did = extractSubjectDIDFromVCs(credential)
    const signInfo = await extractSignInfo({ did, section: 'assertionMethod', keyRef: args.keyRef }, context)

    const verifiableCredential = await context.agent.createVerifiableCredentialLDLocal({
      credential: credential,
      keyRef: signInfo.keyRef,
      // todo: Purpose from signInfo
    })
    let hash = '' //todo: determine hash, without saving
    if (args.persist) {
      hash = await context.agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
    }
    return { verifiableCredential, hash }
  }

  // TODO: Why not have a save param on the method below and adjust the response a bit with a boolean showing persistence status
  public async issueAndSaveVerifiablePresentation(
    args: IIssueAndSaveVerifiablePresentationArgs,
    context: GXRequiredContext
  ): Promise<VerifiablePresentationResponse> {
    const vp = await this.issueVerifiablePresentation({ ...args }, context)
    const selfDescribedVPHash = await context.agent.dataStoreSaveVerifiablePresentation({
      verifiablePresentation: vp as VerifiablePresentationSP,
    })
    return {
      verifiablePresentation: vp,
      vpHash: selfDescribedVPHash,
    }
  }

  public async checkVerifiableCredential(args: ICheckVerifiableCredentialArgs, context: GXRequiredContext): Promise<boolean> {
    const result = await context.agent.verifyCredentialLDLocal({
      credential: args.verifiableCredential,
      fetchRemoteContexts: true,
    })
    return result
  }

  /** {@inheritDoc IGaiaxComplianceClient.issueVerifiablePresentation} */
  public async issueVerifiablePresentation(args: IIssueVerifiablePresentationArgs, context: GXRequiredContext): Promise<VerifiablePresentation> {
    const did = `did:web:${args.domain}`
    const signInfo = await extractSignInfo({ did, section: 'authentication', keyRef: args.keyRef }, context)
    return await context.agent.createVerifiablePresentationLDLocal({
      presentation: {
        id: uuidv4(),
        issuanceDate: new Date(),
        type: ['VerifiablePresentation'],
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        verifiableCredential: args.verifiableCredentials,
        holder: did,
      },
      // purpose: args.purpose, // todo: Make dynamic basied on signInfo and arg
      keyRef: signInfo.keyRef,
      challenge: args.challenge ? args.challenge : GaiaxComplianceClient.getDateChallenge(),
      domain: args.domain ?? this.config.complianceServiceUrl,
    })
  }

  public async checkVerifiablePresentation(args: ICheckVerifiablePresentationArgs, context: GXRequiredContext): Promise<boolean> {
    const domain = this.config.complianceServiceUrl
    const challenge = args.challenge ? args.challenge : GaiaxComplianceClient.getDateChallenge()
    const result = await context.agent.verifyPresentationLDLocal({
      presentation: args.verifiablePresentation,
      challenge,
      domain,
      fetchRemoteContexts: true,
      presentationPurpose: new AuthenticationProofPurpose({ domain, challenge }),
    })
    console.log(result)
    return result
  }
}
