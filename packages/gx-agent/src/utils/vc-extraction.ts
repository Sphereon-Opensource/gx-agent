import { ICredentialSubject } from '@sphereon/ssi-types'
import { CredentialPayload, VerifiableCredential } from '@veramo/core'
import { IGaiaxCredentialType, ServiceOfferingType } from '../types/index.js'

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

export function extractIssuerDIDFromVCs(verifiableCredentials: VerifiableCredential[] | CredentialPayload): string {
  const issuerString = Array.isArray(verifiableCredentials)
    ? getIssuerString(verifiableCredentials[0])
    : getIssuerString(verifiableCredentials as CredentialPayload as VerifiableCredential)
  return issuerString
}

export function extractApiTypeFromVC(vc: VerifiableCredential): string {
  const types = Array.isArray(vc.type) ? vc.type : [vc.type]
  // todo: This is too naive as you can have more than 2 types on a VC. Should simply search for the specific type in the array and if found return it
  const credentialType = types.find((type) => type !== 'VerifiableCredential')
  return credentialType === IGaiaxCredentialType.LegalPerson || IGaiaxCredentialType.NaturalPerson ? 'participant' : 'service-offering'
}

export function getIssuerString(vc: VerifiableCredential): string {
  return isString(vc.issuer) ? (vc.issuer as string) : (vc.issuer as { id: string }).id
}

export function isString(value: unknown): boolean {
  return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]'
}

function getAsStringArray(arrayOrString: string[] | string | undefined): string[] {
  if (!arrayOrString) {
    return []
  } else if (typeof arrayOrString === 'string') {
    return [arrayOrString]
  } else if (Array.isArray(arrayOrString)) {
    return arrayOrString
  }
  return []
}

export function getVcType(verifiableCredential: VerifiableCredential): string {
  const sdTypes = getAsStringArray(verifiableCredential.type)
  let subjectType
  if (Array.isArray(verifiableCredential.credentialSubject)) {
    for (const subject of verifiableCredential.credentialSubject) {
      subjectType = subjectType ? subjectType : subject['type'] ? subject['type'] : subject['@type'] ? subject['@type'] : undefined
    }
  } else {
    subjectType = verifiableCredential.credentialSubject['type']
      ? verifiableCredential.credentialSubject['type']
      : verifiableCredential.credentialSubject['@type']
  }
  const json = JSON.stringify(verifiableCredential)
  if (!subjectType && (json.includes(ServiceOfferingType.DcatDataset.valueOf()) || json.includes(ServiceOfferingType.DcatDataService.valueOf()))) {
    return 'ServiceOffering'
  } else if (sdTypes.length === 1 && sdTypes[0] === 'VerifiableCredential' && subjectType) {
    for (const type of Object.values(ServiceOfferingType)) {
      if (containsType(subjectType, type)) {
        return 'ServiceOffering'
      }
    }
    if (containsType(subjectType, 'LegalPerson') || containsType(subjectType, 'LegalParticipant')) {
      return 'LegalParticipant'
    } else if (containsType(subjectType, 'compliance')) {
      return 'Compliance'
    }
    throw new Error(`Expecting ServiceOffering type in credentialSubject.type. Received: ${subjectType}`)
  }
  //todo: we might wanna limit this to prevent unknown types. Why not simply throw the exception once we reacht this point?
  const type = sdTypes.find((t) => t !== 'VerifiableCredential')
  if (!type && !subjectType) {
    throw new Error(`Provided type for VerifiableCredential is not supported: ${subjectType}`)
  }
  return type ? type : subjectType
}

function containsType(arrayOrString: any, searchValue: string) {
  if (!arrayOrString) {
    return false
  } else if (typeof arrayOrString === 'string') {
    return arrayOrString.includes(searchValue)
  } else if (Array.isArray(arrayOrString)) {
    return arrayOrString.find((elt) => elt.includes(searchValue))
  } else {
    arrayOrString.toString().includes(searchValue)
  }
}
