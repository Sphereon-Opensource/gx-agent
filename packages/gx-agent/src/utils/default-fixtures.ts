import { IGaiaxCredentialType } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { convertDidWebToHost } from './did-utils'

export function exampleParticipantSD({ did }: { did?: string; version?: string }) {
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://registry.gaia-x.eu/v2206/api/shape'],
    issuer: `${did ? did : 'your DID here'}`,
    id: uuidv4(),
    credentialSubject: {
      id: `${did ? did : 'your DID here'}`,
      'gx-participant:name': 'Example Company',
      'gx-participant:legalName': 'Example Company ltd.',
      'gx-participant:website': `'https://${did ? convertDidWebToHost(did) : 'example.com'}'`,
      'gx-participant:registrationNumber': [
        {
          'gx-participant:registrationNumberType': 'local',
          'gx-participant:registrationNumberNumber': '93056589',
        },
        {
          'gx-participant:registrationNumberType': 'vat',
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
        'gx-participant:addressCountryCode': 'NL',
        'gx-participant:addressCode': 'NL-NLD',
        'gx-participant:streetAddress': '2 rue Kellermann',
        'gx-participant:postalCode': '59100',
        'gx-participant:locality': 'Roubaix',
      },
      'gx-participant:legalAddress': {
        'gx-participant:addressCountryCode': 'NL',
        'gx-participant:addressCode': 'NL-NLD',
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
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    issuer: `${did ? did : 'your DID here'}`,
    id: uuidv4(),
    credentialSubject: {
      '@context': {
        cc: 'http://creativecommons.org/ns#',
        schema: 'http://schema.org/',
        void: 'http://rdfs.org/ns/void#',
        owl: 'http://www.w3.org/2002/07/owl#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        'trusted-cloud': 'http://w3id.org/gaia-x/trusted-cloud#',
        'gax-validation': 'http://w3id.org/gaia-x/validation#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        voaf: 'http://purl.org/vocommons/voaf#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        vcard: 'http://www.w3.org/2006/vcard/ns#',
        'gax-core': 'http://w3id.org/gaia-x/core#',
        dct: 'http://purl.org/dc/terms/',
        sh: 'http://www.w3.org/ns/shacl#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        ids: 'https://w3id.org/idsa/core/',
        dcat: 'http://www.w3.org/ns/dcat#',
        vann: 'http://purl.org/vocab/vann/',
        foaf: 'http://xmlns.com/foaf/0.1/',
        did: 'https://www.w3.org/TR/did-core/#',
      },
      id: `${did ? did : 'your DID here'}`,
      'gax-core:offeredBy': [
        {
          '@id': `${did ? did : 'your DID here'}`,
        },
      ],
      'trusted-cloud:generalInformation': {
        '@type': 'trusted-cloud:GeneralInformationService',
        'trusted-cloud:name': {
          '@value': 'Test service',
          '@type': 'xsd:string',
        },
        'trusted-cloud:provisionType': 'hybrid',
        'trusted-cloud:serviceModel': 'PaaS',
        'trusted-cloud:website': {
          '@value': `${url}`,
          '@type': 'xsd:anyURI',
        },
      },
      'trusted-cloud:functionalDescription': {
        '@type': 'trusted-cloud:FunctionalDescriptionService',
        'trusted-cloud:description': {
          '@value': 'test service',
          '@type': 'xsd:string',
        },
        'trusted-cloud:briefDescription': {
          '@value': 'test',
          '@type': 'xsd:string',
        },
      },
      'trusted-cloud:dataCentres': {
        '@id': '1',
      },
      'trusted-cloud:contracts': {
        '@id': 'test',
      },
      'trusted-cloud:security': {
        '@id': 'test',
      },
      'trusted-cloud:dataProtection': {
        '@id': 'test',
      },
      'trusted-cloud:operativeProcesses': {
        '@id': 'test',
      },
      'trusted-cloud:interoperability': {
        '@id': 'test',
      },
      'trusted-cloud:serviceArchitecture': {
        '@id': 'test',
      },
    },
    type: ['VerifiableCredential'],
  }
}
