import { IGaiaxCredentialType } from '../types'
import { v4 as uuidv4 } from 'uuid'

export function exampleParticipantSD({ did }: { did?: string; version?: string }) {
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://registry.gaia-x.eu/v2206/api/shape'],
    issuer: `${did ? did : 'your DID here'}`,
    id: uuidv4(),
    credentialSubject: {
      id: `${did ? did : 'your DID here'}`,
      'gx-participant:name': 'Example Company',
      'gx-participant:legalName': 'Example Company ltd.',
      'gx-participant:website': 'https://participant',
      'gx-participant:registrationNumber': [
        {
          'gx-participant:registrationNumberType': 'localCode',
          'gx-participant:registrationNumberNumber': 'NL001234567B01',
        },
        {
          'gx-participant:registrationNumberType': 'leiCode',
          'gx-participant:registrationNumberNumber': '9695007586GCAKPYJ703',
        },
        {
          'gx-participant:registrationNumberType': 'EUID',
          'gx-participant:registrationNumberNumber': 'FR5910.424761419',
        },
      ],
      'gx-participant:headquarterAddress': {
        'gx-participant:addressCountryCode': 'FR',
        'gx-participant:addressCode': 'FR-HDF',
        'gx-participant:streetAddress': '2 rue Kellermann',
        'gx-participant:postalCode': '59100',
        'gx-participant:locality': 'Roubaix',
      },
      'gx-participant:legalAddress': {
        'gx-participant:addressCountryCode': 'FR',
        'gx-participant:addressCode': 'FR-HDF',
        'gx-participant:streetAddress': '2 rue Kellermann',
        'gx-participant:postalCode': '59100',
        'gx-participant:locality': 'Roubaix',
      },
      'gx-participant:termsAndConditions': '70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700',
    },
    type: [IGaiaxCredentialType.LegalPerson],
  }
}

export function exampleServiceOfferingSD({ url, did }: { url: string; did?: string; version?: string }) {
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://registry.gaia-x.eu/v2206/api/shape'],
    issuer: `${did ? did : 'your DID here'}`,
    id: uuidv4(),
    credentialSubject: {
      id: `${did ? did : 'your DID here'}`,
      'gx-service-offering:providedBy': `${url ? url : 'https://participant'}` + '/.well-known/participant.json',
      'gx-service-offering:name': 'my awesome service',
      'gx-service-offering:description': `a service by ${url ? url : 'https://participant'}`,
      'gx-service-offering:termsAndConditions': [
        {
          'gx-service-offering:url': `${url ? url : 'https://participant'}` + '/terms-and-conditions/',
          'gx-service-offering:hash': 'myrandomhash',
        },
      ],
      'gx-service-offering:gdpr': [
        {
          'gx-service-offering:imprint': `${url ? url : 'https://participant'}` + '/terms-and-conditions/',
        },
        {
          'gx-service-offering:privacyPolicy': `${url ? url : 'https://participant'}` + '/personal-data-protection/',
        },
      ],
      'gx-service-offering:dataExport': {
        'gx-service-offering:requestType': 'email',
        'gx-service-offering:accessType': 'digital',
        'gx-service-offering:formatType': 'mime/png',
      },
    },
    type: [IGaiaxCredentialType.LegalPerson],
  }
}
