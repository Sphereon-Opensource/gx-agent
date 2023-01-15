import { GaiaxComplianceClient } from './GaiaxComplianceClient'
import {
  AuthenticationProofPurpose,
  GXRequiredContext,
  ICheckVerifiablePresentationArgs,
  IGaiaxComplianceConfig,
  IIssueAndSaveVerifiablePresentationArgs,
  IIssueVerifiableCredentialArgs,
  IIssueVerifiablePresentationArgs,
  VerifiablePresentationResponse,
} from '../types'
import { v4 as uuidv4 } from 'uuid'
import { VerifiableCredential, VerifiablePresentation } from '@veramo/core'
import { extractParticipantDidFromVCs } from '../utils/vc-extraction'
import { VerifiablePresentationSP } from '@sphereon/ssi-sdk-core'

export class CredentialHandler {
  public readonly config: IGaiaxComplianceConfig

  constructor(client: GaiaxComplianceClient) {
    this.config = client.config
  }

  public async issueVerifiableCredential(args: IIssueVerifiableCredentialArgs, context: GXRequiredContext): Promise<VerifiableCredential> {
    const credential = args.credential
    if (!credential?.credentialSubject) {
      throw Error('Credential needs a subject')
    }
    if (!credential.credentialSubject?.id) {
      credential.credentialSubject.id = args.verificationMethodId.split('#')[0]
    }
    const verifiableCredential = await context.agent.createVerifiableCredentialLDLocal({
      credential: credential,
      keyRef: args.keyRef,
    })
    return verifiableCredential
  }

  // TODO: Why not have a save param on the method below and adjust the response a bit with a boolean showing persistence status
  public async issueAndSaveVerifiablePresentation(
    args: IIssueAndSaveVerifiablePresentationArgs,
    context: GXRequiredContext
  ): Promise<VerifiablePresentationResponse> {
    const vp = await this.issueVerifiablePresentation(
      {
        challenge: args.challenge ? args.challenge : GaiaxComplianceClient.getDateChallenge(),
        keyRef: args.keyRef,
        purpose: args.purpose,
        verifiableCredentials: args.verifiableCredentials as VerifiableCredential[],
        verificationMethodId: args.verificationMethodId,
      },
      context
    )
    const selfDescribedVPHash = await context.agent.dataStoreSaveVerifiablePresentation({
      verifiablePresentation: vp as VerifiablePresentationSP,
    })
    return {
      verifiablePresentation: vp,
      vpHash: selfDescribedVPHash,
    }
  }

  /** {@inheritDoc IGaiaxComplianceClient.issueVerifiablePresentation} */
  public async issueVerifiablePresentation(args: IIssueVerifiablePresentationArgs, context: GXRequiredContext): Promise<VerifiablePresentation> {
    const participantDid = extractParticipantDidFromVCs(args.verifiableCredentials)
    return await context.agent.createVerifiablePresentationLDLocal({
      presentation: {
        id: uuidv4(),
        issuanceDate: new Date(),
        type: ['VerifiablePresentation'],
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        verifiableCredential: args.verifiableCredentials,
        holder: participantDid,
      },
      purpose: args.purpose,
      keyRef: args.keyRef,
      challenge: args.challenge ? args.challenge : GaiaxComplianceClient.getDateChallenge(),
      domain: this.config.complianceServiceUrl,
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
