import { GXRequiredContext, ISignInfo } from '../types/index.js'
import { DIDDocument, DIDDocumentSection, IIdentifier, IService, TKeyType } from '@veramo/core'
import { mapIdentifierKeysToDocWithJwkSupport } from '@sphereon/ssi-sdk-ext.did-utils'
import { getAgent, globalConfig } from '../agent/index.js'

export function convertDidWebToHost(did: string) {
  did = did.substring(8)
  did = did.replace(/:/g, '/')
  did = did.replace(/%/g, ':')
  return did
}

export async function extractSignInfo(
  { did, section, keyRef }: { did: string; section?: DIDDocumentSection; keyRef?: string },
  context: GXRequiredContext
): Promise<ISignInfo> {
  const verificationRelationship: DIDDocumentSection = section ? section : 'verificationMethod'

  const id = await context.agent.didManagerGet({ did })
  const didDoc = await exportToDIDDocument(id)
  const keys = await mapIdentifierKeysToDocWithJwkSupport(id, verificationRelationship, context, didDoc)
  if (!keys || keys.length === 0) {
    throw Error(`No suitable keys found to issue a verifiable credential for ${did} and ${verificationRelationship} Verification Relationship`)
  }
  const key = keyRef ? keys.find((key) => key.kid === keyRef) : keys[0]

  if (!key) {
    // Can only be keyref, as we already checked for an empty array above
    throw Error(`Could not find key with keyref ${keyRef}`)
  }

  return {
    keyRef: keyRef ? keyRef : key.kid,
    keys,
    key,
    participantDID: did,
    participantDomain: convertDidWebToHost(did),
    verificationRelationship,
  }
}

export async function exportToDIDDocument(identifier: IIdentifier, opts?: { services?: IService[] }): Promise<DIDDocument> {
  const keyMapping: Record<TKeyType, string> = {
    Secp256k1: 'EcdsaSecp256k1VerificationKey2019',
    Secp256r1: 'EcdsaSecp256r1VerificationKey2019',
    Ed25519: 'Ed25519VerificationKey2018',
    X25519: 'X25519KeyAgreementKey2019',
    Bls12381G1: 'Bls12381G1Key2020',
    Bls12381G2: 'Bls12381G2Key2020',
    RSA: 'JsonWebKey2020',
  } as Record<TKeyType, string>

  if ((!identifier.keys || identifier.keys.length === 0) && !identifier.controllerKeyId) {
    throw Error(`No keys found for identifier: ${identifier}`)
  }

  const allKeys = identifier.keys.map((key) => ({
    id: identifier.did + '#' + key.kid,
    type: keyMapping[key.type],
    controller: identifier.did,
    ...(key?.meta?.publicKeyJwk ? { publicKeyJwk: key?.meta?.publicKeyJwk } : {}),
    ...(!key?.meta?.publicKeyJwk ? { publicKeyHex: key.publicKeyHex } : {}),
  }))
  // ed25519 keys can also be converted to x25519 for key agreement
  const keyAgreementKeyIds = allKeys
    .filter((key) => ['Ed25519VerificationKey2018', 'X25519KeyAgreementKey2019'].includes(key.type))
    .map((key) => key.id)
  const signingKeyIds = allKeys.filter((key) => key.type !== 'X25519KeyAgreementKey2019').map((key) => key.id)

  const didDoc = {
    '@context': 'https://w3id.org/did/v1',
    id: identifier.did,
    verificationMethod: allKeys,
    ...(signingKeyIds.length > 0
      ? {
          authentication: signingKeyIds,
          assertionMethod: signingKeyIds,
        }
      : {}),
    ...(keyAgreementKeyIds.length > 0 ? { keyAgreement: keyAgreementKeyIds } : {}),
    service: [...(opts?.services || []), ...(identifier?.services || [])],
  }

  return didDoc
}

export async function asDID(input?: string, show?: boolean): Promise<string> {
  let did = input ? input : globalConfig?.gx?.particpantDID
  if (!did) {
    const ids = await (await getAgent()).didManagerFind()
    if (ids.length === 1) {
      did = ids[0].did
    } else {
      throw Error(
        'Domain or DID expected, but received nothing. Either provide an argument, set a `particpantDID` in the agent.yml, or create a single DID'
      )
    }
  }
  if (show) {
    console.log(did)
  }
  if (did.startsWith('did:web:')) {
    return did
  }
  return `did:web:${did.replace(/https?:\/\/([^/?#]+).*/i, '$1').toLowerCase()}`
}
