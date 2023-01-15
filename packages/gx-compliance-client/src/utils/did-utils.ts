import { GXRequiredContext, ISignatureInfo } from '../types'
import { InvalidArgumentError } from 'commander'

function convertDidWebToHost(did: string) {
  did = did.substring(8)
  did = did.replace(/:/g, '/')
  did = did.replace(/%/g, ':')
  return did
}

export async function extractSignatureInfo(did: string, context: GXRequiredContext): Promise<ISignatureInfo> {
  const didResolutionResult = await context.agent.resolveDid({ didUrl: did })
  if (!didResolutionResult.didDocument?.verificationMethod) {
    throw new InvalidArgumentError('There is no verification method') // fixme: that is valid, see remark below
  }
  // fixme: This is too naive. You can have multiple VMs, you can even have full VM types, not listed in Verification Method like for instance in authentication.
  // Purposes can either be references to a single VM listed in VM, then the purpose is a string. Or it can be it's own standalone VM not listed in VM. Then it is a full json object in for instance authentication
  // For VC/VP issuance you will want to have one from assertionMethod. The agent already checks for that in the ld-handler-local module.
  // There are methods in ssi-sdk/ssi-sdk-did-utils to dereference VM relationships against local keys
  // also this needs to be in a separate file to begin with.
  const verificationMethodId = didResolutionResult.didDocument.verificationMethod[0].id as string
  const keyRef = (await context.agent.didManagerGet({ did })).keys[0].kid

  return {
    keyRef,
    participantDid: did,
    participantDomain: convertDidWebToHost(did),
    verificationMethodId,
    proofPurpose: 'assertionMethod',
  }
}
