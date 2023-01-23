import { ICredentialSubject } from '@sphereon/ssi-types'
import { CredentialPayload, VerifiableCredential } from '@veramo/core'
import { IGaiaxCredentialType } from '../types'

export function extractSubjectDIDFromVCs(verifiableCredentials: VerifiableCredential[] | CredentialPayload) {
  const credentialSubject = Array.isArray(verifiableCredentials)
    ? verifiableCredentials[0].credentialSubject
    : verifiableCredentials.credentialSubject // todo: check whether other credentials have the same subject?
  let participantDID
  if (Array.isArray(credentialSubject)) {
    const singleCredentialSubject = (credentialSubject as ICredentialSubject[]).filter((s) => !!s.id).pop()
    if (!credentialSubject) {
      throw new Error('No subject DID present')
    }
    participantDID = (singleCredentialSubject as ICredentialSubject)['id'] as string
  } else {
    participantDID = (credentialSubject as ICredentialSubject)['id'] as string
  }
  if (!participantDID) {
    throw new Error("Subject DID can't be extracted from received VerifiableCredentials. Please make sure the credentialSubject id is set")
  }
  return participantDID
}

export function extractApiTypeFromVC(vc: VerifiableCredential): string {
  const types = Array.isArray(vc.type) ? vc.type : [vc.type]
  // todo: This is too naive as you can have more than 2 types on a VC. Should simply search for the specific type in the array and if found return it
  const credentialType = types.find((type) => type !== 'VerifiableCredential')
  return credentialType === IGaiaxCredentialType.LegalPerson || IGaiaxCredentialType.NaturalPerson ? 'participant' : 'service-offering'
}
