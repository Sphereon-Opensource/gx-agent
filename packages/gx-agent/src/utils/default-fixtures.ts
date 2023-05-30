import { IGaiaxCredentialType, ServiceOfferingType } from '../types/index.js'
import { v4 as uuidv4 } from 'uuid'
import { convertDidWebToHost } from './index.js'
import { CredentialPayload } from '@veramo/core'

export function createSDCredentialFromPayload({ did, payload }: { payload: unknown; did?: string }): CredentialPayload {
  const json = typeof payload === 'string' ? payload : JSON.stringify(payload)
  const credentialSubject = { ...getGeneralServiceOffering2210Subject(did), ...JSON.parse(json) }
  if (credentialSubject['@id']) {
    if (credentialSubject.id && credentialSubject['@id'] !== credentialSubject.id) {
      throw Error(`Mismatch in credential subject ids. Supplied: ${credentialSubject['@id']}, agent: ${did}`)
    }
    credentialSubject.id = credentialSubject['@id']
    delete credentialSubject['@id']
  }

  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    issuer: `${did ? did : 'your DID here'}`,
    type: ['VerifiableCredential'],
    id: `urn:uuid:${uuidv4()}`,
    credentialSubject,
  }
}

export function exampleParticipantSD1_2_8({ did }: { did?: string; version?: string }) {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#',
    ],
    type: ['VerifiableCredential'],
    id: `urn:uuid:${uuidv4()}`,
    issuer: `${did ? did : 'your DID here'}`,
    issuanceDate: new Date().toISOString(),
    //todo: fix this
    credentialSubject: {
      id: `${did ? did : 'your DID here'}`,
      type: 'gx:LegalParticipant',
      'gx:legalName': 'Gaia-X European Association for Data and Cloud AISBL',
      'gx:legalRegistrationNumber': {
        'gx:vatID': 'BE0762747721',
      },
      'gx:headquarterAddress': {
        'gx:countrySubdivisionCode': 'BE-BRU',
      },
      'gx:legalAddress': {
        'gx:countrySubdivisionCode': 'BE-BRU',
      },
      'gx-terms-and-conditions:gaiaxTermsAndConditions': '70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700',
    },
  }
}

export function exampleParticipantSD({ did }: { did?: string; version?: string }) {
  return {
    //fixme: discuss this subject later, gaia-x shpaes is not available anymore
    '@context': ['https://www.w3.org/2018/credentials/v1', 'http://20.76.5.229/v2206/api/shape'],
    issuer: `${did ? did : 'your DID here'}`,
    id: `urn:uuid:${uuidv4()}`,
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

export function exampleParticipantSD2210({ did }: { did?: string; version?: string }) {
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    issuer: `${did ? did : 'your DID here'}`,
    id: `urn:uuid:${uuidv4()}`,
    credentialSubject: {
      '@context': {
        cc: 'http://creativecommons.org/ns#',
        schema: 'http://schema.org/',
        cred: 'https://www.w3.org/2018/credentials#',
        void: 'http://rdfs.org/ns/void#',
        owl: 'http://www.w3.org/2002/07/owl#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        'gax-validation': 'http://w3id.org/gaia-x/validation#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        voaf: 'http://purl.org/vocommons/voaf#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        vcard: 'http://www.w3.org/2006/vcard/ns#',
        'gax-core': 'http://w3id.org/gaia-x/core#',
        dct: 'http://purl.org/dc/terms/',
        sh: 'http://www.w3.org/ns/shacl#',
        'gax-trust-framework': 'http://w3id.org/gaia-x/gax-trust-framework#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        ids: 'https://w3id.org/idsa/core/',
        dcat: 'http://www.w3.org/ns/dcat#',
        vann: 'http://purl.org/vocab/vann/',
        foaf: 'http://xmlns.com/foaf/0.1/',
        did: 'https://www.w3.org/TR/did-core/#',
      },
      id: `${did ? did : 'your DID here'}`,
      '@type': 'gax-trust-framework:LegalPerson',
      'gax-trust-framework:legalName': {
        '@value': 'your legalName here',
        '@type': 'xsd:string',
      },
      // TODO: do we need an enum for this? because the gx example has a lot of German values in it such as GmbH, GbR, ...
      'gax-trust-framework:legalForm': 'your legalForm here (LLC, LP, Corporation, Nonprofit corporation, JSCo, ...) ',
      'gax-trust-framework:registrationNumber': {
        '@value': 'your registrationNumber here',
        '@type': 'xsd:string',
      },
      'gax-trust-framework:legalAddress': {
        '@type': 'vcard:Address',
        'vcard:country-name': {
          '@value': 'your Country name here',
          '@type': 'xsd:string',
        },
        'vcard:gps': {
          '@value': 'your gps coordinates here',
          '@type': 'xsd:string',
        },
        'vcard:street-address': {
          '@value': 'your street address here',
          '@type': 'xsd:string',
        },
        'vcard:postal-code': {
          '@value': 'your postal code here',
          '@type': 'xsd:string',
        },
        'vcard:locality': {
          '@value': 'your city here',
          '@type': 'xsd:string',
        },
      },
      'gax-trust-framework:headquarterAddress': {
        '@type': 'vcard:Address',
        'vcard:country-name': {
          '@value': 'your country name here',
          '@type': 'xsd:string',
        },
        'vcard:gps': {
          '@value': 'your gps coordinates here',
          '@type': 'xsd:string',
        },
        'vcard:street-address': {
          '@value': 'your street address here',
          '@type': 'xsd:string',
        },
        'vcard:postal-code': {
          '@value': 'your postal code here',
          '@type': 'xsd:string',
        },
        'vcard:locality': {
          '@value': 'your city here',
          '@type': 'xsd:string',
        },
      },
    },
    type: ['VerifiableCredential'],
  }
}

export function exampleServiceOfferingSD({ url, did }: { url: string; did?: string; version?: string }) {
  return {
    //fixme: discuss this subject later, gaia-x shpaes is not available anymore
    '@context': ['https://www.w3.org/2018/credentials/v1', 'http://20.76.5.229/v2206/api/shape'],
    issuer: `${did ? did : 'your DID here'}`,
    id: `urn:uuid:${uuidv4()}`,
    credentialSubject: {
      id: `${did ? did : 'your DID here'}`,
      'gx-service-offering:providedBy': `${url ? url : 'https://participant.example.com'}` + '/.well-known/participant.json',
      'gx-service-offering:name': 'my awesome service',
      'gx-service-offering:description': `a service by ${url ? url : 'https://participant.example.com'}`,
      'gx-service-offering:termsAndConditions': [
        {
          'gx-service-offering:url': `${url ? url : 'https://participant.example.com'}` + '/terms-and-conditions/',
          'gx-service-offering:hash': 'myrandomhash',
        },
      ],
      'gx-service-offering:gdpr': [
        {
          'gx-service-offering:imprint': `${url ? url : 'https://participant.example.com'}` + '/terms-and-conditions/',
        },
        {
          'gx-service-offering:privacyPolicy': `${url ? url : 'https://participant.example.com'}` + '/personal-data-protection/',
        },
      ],
      'gx-service-offering:dataExport': {
        'gx-service-offering:requestType': 'email',
        'gx-service-offering:accessType': 'digital',
        'gx-service-offering:formatType': 'mime/png',
      },
    },
    type: [IGaiaxCredentialType.ServiceOffering],
  }
}

export function exampleServiceOfferingSD2210({ url, did, type }: { url: string; did?: string; type: ServiceOfferingType; version?: string }) {
  let credentialSubject
  switch (type) {
    case ServiceOfferingType.DcatDataset:
      credentialSubject = createDcatDatasetSubject(url, did)
      break
    case ServiceOfferingType.DcatDataService:
      credentialSubject = createDcatDataServiceSubject(url, did)
      break
    case ServiceOfferingType.AutoscaledVirtualMachine:
      credentialSubject = createAutoscaledVirtualMachineSubject(url, did)
      break
    case ServiceOfferingType.ComputeFunction:
      credentialSubject = createComputeFunctionSubject(url, did)
      break
    case ServiceOfferingType.IdentityAccessManagementOffering:
      credentialSubject = createIdentityAccessManagementOfferingSubject(did)
      break
    case ServiceOfferingType.VirtualMachine:
      credentialSubject = createVirtualMachineSubject(did)
      break
    case ServiceOfferingType.InstantiatedVirtualResource:
      credentialSubject = createInstantiatedVirtualResourceSubject(did)
      break
    case ServiceOfferingType.VerifiableCredentialWallet:
      credentialSubject = createVerifiableCredentialWalletSubject(did)
      break
    case ServiceOfferingType.PlatformOffering:
      credentialSubject = createPlatformOfferingSubject(did)
      break
    case ServiceOfferingType.Location:
      credentialSubject = createLocationSubject(did)
      break
    case ServiceOfferingType.ObjectStorageOffering:
      credentialSubject = createObjectStorageOfferingSubject(did)
      break
    case ServiceOfferingType.BigData:
      credentialSubject = createBigDataSubject(did)
      break
    case ServiceOfferingType.InfrastructureOffering:
      credentialSubject = createInfrastructureOfferingSubject(did)
      break
    case ServiceOfferingType.Connectivity:
      credentialSubject = createConnectivitySubject(did)
      break
    case ServiceOfferingType.ServiceOffering:
      credentialSubject = createServiceOfferingSubject(did)
      break
    case ServiceOfferingType.Database:
      credentialSubject = createDatabaseSubject(did)
      break
    case ServiceOfferingType.WalletOffering:
      credentialSubject = createWalletOfferingSubject(did)
      break
    case ServiceOfferingType.ImageRegistryOffering:
      credentialSubject = createImageRegistryOfferingSubject(did)
      break
    case ServiceOfferingType.IdentityFederation:
      credentialSubject = createIdentityFederationSubject(did)
      break
    case ServiceOfferingType.SoftwareOffering:
      credentialSubject = createSoftwareOfferingSubject(did)
      break
    case ServiceOfferingType.LinkConnectivity:
      credentialSubject = createLinkConnectivitySubject(did)
      break
    case ServiceOfferingType.PhysicalConnectivity:
      credentialSubject = createPhysicalConnectivitySubject(did)
      break
    case ServiceOfferingType.Container:
      credentialSubject = createContainerSubject(did)
      break
    case ServiceOfferingType.Interconnection:
      credentialSubject = createInterconnectionSubject(did)
      break
    case ServiceOfferingType.StorageOffering:
      credentialSubject = createStorageOfferingSubject(did)
      break
    case ServiceOfferingType.AutoscaledContainer:
      credentialSubject = createAutoscaledContainerSubject(did)
      break
    case ServiceOfferingType.Catalogue:
      credentialSubject = createCatalogueSubject(did)
      break
    case ServiceOfferingType.Compute:
      credentialSubject = createComputeSubject(did)
      break
    case ServiceOfferingType.NetworkOffering:
      credentialSubject = createNetworkOfferingSubject(did)
      break
    case ServiceOfferingType.NetworkConnectivity:
      credentialSubject = createNetworkConnectivitySubject(did)
      break
    case ServiceOfferingType.LocatedServiceOffering:
      credentialSubject = createLocatedServiceOfferingSubject(did)
      break
    case ServiceOfferingType.BareMetal:
      credentialSubject = createBareMetalSubject(did)
      break
    case ServiceOfferingType.FileStorageOffering:
      credentialSubject = createFileStorageOfferingSubject(did)
      break
    case ServiceOfferingType.IdentityProvider:
      credentialSubject = createIdentityProviderSubject(did)
      break
    case ServiceOfferingType.Orchestration:
      credentialSubject = createOrchestrationSubject(did)
      break
    case ServiceOfferingType.BlockStorageOffering:
      credentialSubject = createBlockStorageOfferingSubject(did)
      break
    case ServiceOfferingType.DigitalIdentityWallet:
      credentialSubject = createDigitalIdentityWalletSubject(did)
      break
  }
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    issuer: `${did ? did : 'your DID here'}`,
    id: `urn:uuid:${uuidv4()}`,
    credentialSubject,
    type: ['VerifiableCredential'],
  }
}

function getGeneralServiceOffering2210Subject(did?: string) {
  return {
    '@context': {
      cc: 'http://creativecommons.org/ns#',
      schema: 'http://schema.org/',
      cred: 'https://www.w3.org/2018/credentials#',
      void: 'http://rdfs.org/ns/void#',
      owl: 'http://www.w3.org/2002/07/owl#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      'gax-validation': 'http://w3id.org/gaia-x/validation#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      voaf: 'http://purl.org/vocommons/voaf#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      vcard: 'http://www.w3.org/2006/vcard/ns#',
      'gax-core': 'http://w3id.org/gaia-x/core#',
      dct: 'http://purl.org/dc/terms/',
      sh: 'http://www.w3.org/ns/shacl#',
      'gax-trust-framework': 'http://w3id.org/gaia-x/gax-trust-framework#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      ids: 'https://w3id.org/idsa/core/',
      dcat: 'http://www.w3.org/ns/dcat#',
      vann: 'http://purl.org/vocab/vann/',
      foaf: 'http://xmlns.com/foaf/0.1/',
      did: 'https://www.w3.org/TR/did-core/#',
    },
    //fixme id should change to did:web:registry.gaia-x.eu:<service-type>:random alphanumeric like: 0EhGVCJEBe9p2AxKPydcK6O3F3Wememi4sui
    id: `${did ? did : 'your DID here'}`,
  }
}

function createAutoscaledVirtualMachineSubject(url: string, did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:AutoscaledVirtualMachine',
    'gax-trust-framework:autoscaledVmServiceSpec': {
      '@id': 'spec**',
    },
    ...codeArtifactFixture(),
    ...offeredByFixture(),
    ...serviceOfferingNameFixture(),
    ...instantiationReqFixture(),
    ...termsAndConditionsFixture(),
    ...policyFixture(),
    ...dataAccountExportFixture(),
    ...providedByFixture(did),
  }
}

function createComputeFunctionSubject(url: string, did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    // '@id': 'did:web:registry.gaia-x.eu:ComputeFunction:0EhGVCJEBe9p2AxKPydcK6O3F3Wememi4sui',
    '@type': 'gax-trust-framework:ComputeFunction',
    ...serviceOfferingNameFixture(),
    ...offeredByFixture(),
    'gax-trust-framework:code': {
      '@id': 'your code **',
    },
    ...codeArtifactFixture(),
    'gax-trust-framework:trigger': {
      '@id': 'your trigger**',
    },
    ...instantiationReqFixture(),
    ...termsAndConditionsFixture(),
    ...policyFixture(),
    ...dataAccountExportFixture(),
    ...providedByFixture(did),
  }
}

function createIdentityAccessManagementOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:IdentityAccessManagementOffering',
  }
}

function createVirtualMachineSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    id: 'did:web:you',
    '@type': 'gax-trust-framework:VirtualMachine',
    ...codeArtifactFixture(),
    ...offeredByFixture(),
    ...serviceOfferingNameFixture(),
    ...termsAndConditionsFixture(),
    ...instantiationReqFixture(),
    ...policyFixture(),
    ...dependsOnFixture(),
    ...tenantSeparationFixture(),
    ...dataProtectionRegimeFixture(),
    ...dataAccountExportFixture(),
    ...dctDescriptionFixture(),
    ...dcatKeywordFixture(),
    ...provisionTypeFixture(),
    ...providedByFixture(did),
    ...aggregationOfFixture(),
    ...dependsOnFixture(),
    ...serviceOfferingLocationsFixture(),
  }
}

function createInstantiatedVirtualResourceSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:InstantiatedVirtualResource',
    'gax-trust-framework:copyrightOwnedBy': {
      '@type': 'foaf:Agent',
      'foaf:name': {
        '@value': 'ownedBy name*',
        '@type': 'xsd:string',
      },
    },
    'gax-trust-framework:maintainedBy': {
      '@id': 'your maintained by list**',
    },
    ...serviceOfferingNameFixture(),
    'gax-core:operatedBy': {
      '@id': ' operated by dids**',
    },
    ...dctDescriptionFixture(),
    'gax-trust-framework:license': {
      '@value': 'your license identifiers or urls**',
      '@type': 'xsd:string',
    },
    'gax-trust-framework:hostedOn': {
      '@id': 'where the instance of this virtual resource is being excecuted on**',
    },
    ...policyFixture(),
    'gax-trust-framework:instanceOf': {
      '@id': 'your resource is instance of**',
    },
    ...aggregationOfFixture(),
    'gax-trust-framework:tenantOwnedBy': {
      '@id': 'your tenant is owned by',
    },
    'gax-trust-framework:serviceAccessPoint': {
      '@type': 'gax-trust-framework:ServiceAccessPoint',
      ...serviceOfferingNameFixture(),
      'gax-trust-framework:host': {
        '@value': 'undefined**',
        '@type': 'xsd:string',
      },
      'gax-trust-framework:protocol': {
        '@value': 'undefined**',
        '@type': 'xsd:string',
      },
      'gax-trust-framework:version': {
        '@value': 'undefined**',
        '@type': 'xsd:string',
      },
      'gax-trust-framework:port': {
        '@value': 'undefined**',
        '@type': 'xsd:string',
      },
      'gax-trust-framework:openAPI': {
        '@value': 'undefined**',
        '@type': 'xsd:string',
      },
    },
  }
}

function createVerifiableCredentialWalletSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:VerifiableCredentialWallet',
    'gax-trust-framework:verifiableCredentialExportFormat': {
      '@value': 'your export vc format**',
      '@type': 'xsd:string',
    },
    'gax-trust-framework:privateKeyExportFormat': {
      '@value': 'private key export format**',
      '@type': 'xsd:string',
    },
  }
}

function createPlatformOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:PlatformOffering',
    ...offeredByFixture(),
    ...serviceOfferingNameFixture(),
    ...termsAndConditionsFixture(),
    ...policyFixture(),
    ...dependsOnFixture(),
    ...dataProtectionRegimeFixture(),
    ...dataAccountExportFixture(),
    ...dctDescriptionFixture(),
    ...dcatKeywordFixture(),
    ...provisionTypeFixture(),
    ...providedByFixture(did),
    ...aggregationOfFixture(),
    ...dependsOnFixture(),
    ...serviceOfferingLocationsFixture(),
  }
}

function createLocationSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:Location',
    'gax-trust-framework:hasProvider': {
      '@id': 'didprociderOfThisso*',
    },
    'gax-trust-framework:canHostServiceOffering': {
      '@id': 'yourlistofhostsforthisso*',
    },
    'gax-trust-framework:hasAdministrativeLocation': {
      '@value': 'iso3166-2digitstringforthisso*',
      '@type': 'xsd:string',
    },
    'gax-trust-framework:hasLocatedServiceOffering': {
      '@id': 'idsoflocatedsosinthislocation*',
    },
  }
}

function createObjectStorageOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:ObjectStorageOffering',
    'gax-trust-framework:fileSystem': 'filesystem',
  }
}

//todo: https://sd-creation-wizard.gxfs.dev/select-file has problem with this type
function createBigDataSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
  }
}

function createInfrastructureOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:InfrastructureOffering',
    ...serviceOfferingNameFixture(),
    ...offeredByFixture(),
    ...termsAndConditionsFixture(),
    ...policyFixture(),
    ...dependsOnFixture(),
    ...dataProtectionRegimeFixture(),
    ...dataAccountExportFixture(),
    ...dctDescriptionFixture(),
    ...dcatKeywordFixture(),
    ...provisionTypeFixture(),
    ...providedByFixture(did),
    ...aggregationOfFixture(),
    ...dependsOnFixture(),
    ...serviceOfferingLocationsFixture(),
  }
}

function createConnectivitySubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:Connectivity',
    ...instantiationReqFixture(),
  }
}

function createServiceOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'trusted-cloud:ServiceOffering',
    ...offeredByFixture(),
    ...cloudGeneralInformationFixture(),
    ...aggregationOfFixture(),
    ...dependsOnFixture(),
    ...cloudFunctionalDescriptionFixture(),
    ...mainContactFixture(),
    ...additionalContactFixture(),
    'trusted-cloud:typeOfProcessedData': "'personal data according to GDPR' or 'no information'",
    ...subcontractorsFixture(),
    ...dataCentresFixture(),
    ...certificatesFixture(),
    ...contractsFixture(),
    ...trustedCloudSecurityFixture(),
  }
}

//todo: https://sd-creation-wizard.gxfs.dev/select-file has problem with this type
function createDatabaseSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
  }
}

//todo: https://sd-creation-wizard.gxfs.dev/select-file has problem with this type
function createWalletOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
  }
}

function createImageRegistryOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:ImageRegistryOffering',
    ...imageFixture(),
    'gax-trust-framework:encryption': {
      '@type': 'gax-trust-framework:Encryption',
      'gax-trust-framework:encryptionAlgorithm': 'rsa or none',
      'gax-trust-framework:keyManagement': 'managed, byok or hyok',
    },
    'gax-trust-framework:privateImagesAllowed': true,
  }
}

//todo: https://sd-creation-wizard.gxfs.dev/select-file has problem with this type
function createIdentityFederationSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
  }
}

function createSoftwareOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'trusted-cloud:ServiceOffering',
    ...offeredByFixture(did),
    ...cloudGeneralInformationFixture(),
    ...cloudFunctionalDescriptionFixture(),
    ...aggregationOfFixture(),
    ...dependsOnFixture(),
    ...mainContactFixture(),
    ...additionalContactFixture(),
    ...subcontractorsFixture(),
    ...certificatesFixture(),
    ...dataCentresFixture(),
    ...contractsFixture(),
    ...trustedCloudSecurityFixture(),
  }
}

function createLinkConnectivitySubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:LinkConnectivity',
    ...instantiationReqFixture(),
    ...gxBandwidthFixture(),
    ...gxAvailabilityFixture(),
    ...gxPacketLossFixture(),
    ...gxJitterFixture(),
    ...gxVlanTypeFixture(),
    ...gxVlanTagFixture(),
    ...vlanEtherTypeFixture(),
  }
}

function createPhysicalConnectivitySubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:PhysicalConnectivity',
    ...instantiationRequirementsFixture(),
    ...gxConnectionFixture(),
  }
}

function createContainerSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:Container',
    ...serviceOfferingNameFixture(),
    ...imageFixture(),
    ...codeArtifactFixture(),
    ...offeredByFixture(),
    ...termsAndConditionsFixture(),
    ...aggregationOfFixture(),
    ...instantiationReqFixture(),
    ...resourceLimitsFixture(),
    ...policyFixture(),
    ...tenantSeparationFixture(),
    ...dependsOnFixture(),
    ...dataProtectionRegimeFixture(),
    ...dataAccountExportFixture(),
    ...dctDescriptionFixture(),
    ...dcatKeywordFixture(),
    ...provisionTypeFixture(),
    ...gxEndpointFixture(),
    ...aggregationOfFixture(),
    ...dependsOnFixture(),
    ...serviceOfferingLocationsFixture(),
    ...providedByFixture(did),
  }
}

function createInterconnectionSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:Interconnection',
    ...serviceOfferingNameFixture(),
    'gax-trust-framework:location': {
      '@type': 'vcard:Address',
      'vcard:country-name': {
        '@value': 'yourCountryName*',
        '@type': 'xsd:string',
      },
      'vcard:gps': {
        '@value': 'yourGPS',
        '@type': 'xsd:string',
      },
      'vcard:street-address': {
        '@value': 'yourStreetName',
        '@type': 'xsd:string',
      },
      'vcard:postal-code': {
        '@value': 'yourPostalCode',
        '@type': 'xsd:string',
      },
      'vcard:locality': {
        '@value': 'yourCity',
        '@type': 'xsd:string',
      },
    },
    'gax-trust-framework:nicPortReq': {
      '@value': 'yournicPortRec',
      '@type': 'xsd:string',
    },
    'http://w3id.org/gaia-x/gax-trust-framework#interface.type': {
      '@value': 'yourInterfaceType',
      '@type': 'xsd:string',
    },
    'gax-trust-framework:vendor': 'intel',
    'gax-trust-framework:connectionPointA': {
      '@value': 'idOfTheconnectionSource',
      '@type': 'xsd:string',
    },
    'gax-trust-framework:connectionPointZ': {
      '@value': 'idOfTheconnectionDestination',
      '@type': 'xsd:string',
    },
    'gax-trust-framework:latency': gxMeasureFixture(),
    ...gxAvailabilityFixture(),
    ...gxPacketLossFixture(),
    ...gxJitterFixture(),
    'gax-trust-framework:targetPercentile': gxMeasureFixture(),
    'gax-trust-framework:connectionType': {
      '@value': 'your connection type',
      '@type': 'xsd:string',
    },
    ...gxVlanTypeFixture(),
    ...gxVlanTagFixture(),
    ...vlanEtherTypeFixture(),
    'gax-trust-framework:connectedNetwork_A': {
      '@value': 'number value',
      '@type': 'xsd:decimal',
    },
    'gax-trust-framework:connectedNetwork_Z': {
      '@value': 'number value',
      '@type': 'xsd:decimal',
    },
    'gax-trust-framework:prefixSet_A': {
      '@value': 'yourPrefixSet_A',
      '@type': 'xsd:string',
    },
    'gax-trust-framework:prefixSet_Z': {
      '@value': 'yourPrefixSet_Z',
      '@type': 'xsd:string',
    },
    ...gxBandwidthFixture(),
  }
}

function createStorageOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:StorageOffering',
    'gax-trust-framework:serviceType': "'bare-metal', 'virtual' or 'mixed'",
    'gax-trust-framework:encryptionMethod': "'None', 'managed', 'byok' or 'hyok'",
    'gax-trust-framework:snapshotSupported': true,
    'gax-trust-framework:backupsSupported': true,
  }
}

function createAutoscaledContainerSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:AutoscaledContainer',
    ...codeArtifactFixture(),
    ...serviceOfferingNameFixture(),
    ...offeredByFixture(),
    ...imageFixture(),
    ...termsAndConditionsFixture(),
    ...resourceLimitsFixture(),
    ...instantiationReqFixture(),
    ...policyFixture(),
    ...dependsOnFixture(),
    ...tenantSeparationFixture(),
    ...dataProtectionRegimeFixture(),
    ...dataAccountExportFixture(),
    ...dctDescriptionFixture(),
    ...dcatKeywordFixture(),
    ...provisionTypeFixture(),
    ...gxEndpointFixture(),
    ...providedByFixture(did),
    ...aggregationOfFixture(),
    ...dependsOnFixture(),
    ...serviceOfferingLocationsFixture(),
    ...standardConformityFixture(),
  }
}

function createCatalogueSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:Catalogue',
    ...serviceOfferingNameFixture(),
    'gax-trust-framework:getVerifiableCredentialsIDs': {
      '@value': 'your VerifiableCredential locations *',
      '@type': 'xsd:string',
    },
    ...offeredByFixture(),
    ...termsAndConditionsFixture(),
    ...policyFixture(),
    ...dependsOnFixture(),
    ...dataProtectionRegimeFixture(),
    ...dataAccountExportFixture(),
    ...dctDescriptionFixture(),
    ...dcatKeywordFixture(),
    ...provisionTypeFixture(),
    ...gxEndpointFixture(),
    ...providedByFixture(did),
    ...aggregationOfFixture(),
    ...dependsOnFixture(),
    ...serviceOfferingLocationsFixture(),
    ...standardConformityFixture(),
  }
}

function createComputeSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:Compute',
    ...offeredByFixture(),
    ...serviceOfferingNameFixture(),
    ...codeArtifactFixture(),
    ...termsAndConditionsFixture(),
    ...instantiationReqFixture(),
    ...policyFixture(),
    ...dependsOnFixture(),
    ...tenantSeparationFixture(),
    ...dataProtectionRegimeFixture(),
    ...dataAccountExportFixture(),
    ...dctDescriptionFixture(),
    ...dcatKeywordFixture(),
    ...provisionTypeFixture(),
    ...gxEndpointFixture(),
    ...providedByFixture(did),
    ...aggregationOfFixture(),
    ...dependsOnFixture(),
    ...serviceOfferingLocationsFixture(),
    ...standardConformityFixture(),
  }
}

function createNetworkOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:NetworkOffering',
    'gax-trust-framework:serviceType': "'virtual', 'bare-metal' or 'mixed'",
    'gax-trust-framework:publicIpAddressProvisioning': "'floating', 'fixed' or 'provider-network'",
    'gax-trust-framework:ipVersion': "'IPv4' or 'IPv6'",
    'gax-trust-framework:tenantSeparation': "'physical' or 'virtual'",
  }
}

function createNetworkConnectivitySubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:NetworkConnectivity',
    ...instantiationRequirementsFixture(),
    'gax-trust-framework:SourceAccessPoint': {
      '@value': 'your source accesspoint',
      '@type': 'xsd:string',
    },
    'gax-trust-framework:DestinationAccessPoint': {
      '@value': 'your destination accesspoint',
      '@type': 'xsd:string',
    },
  }
}

function createLocatedServiceOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:LocatedServiceOffering',
    'gax-trust-framework:isImplementationOf': {
      '@id': 'Id of the Service Offering referenced by this located service',
    },
    'gax-trust-framework:isHostedOn': {
      '@id': 'Id of the Location where this located service is hosted on',
    },
    'gax-trust-framework:hasComplianceCertificateClaim': {
      '@id': 'Ids of the compliance reference claims claimed by the provider for the located service',
    },
    'gax-trust-framework:hasComplianceCertificateCredential': {
      '@id': 'Ids of the compliance reference claim claimed by the provider for the located service',
    },
  }
}

function createBareMetalSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:BareMetal',
    ...offeredByFixture(),
    ...serviceOfferingNameFixture(),
    ...codeArtifactFixture(),
    ...instantiationReqFixture(),
    ...aggregationOfFixture(),
    ...termsAndConditionsFixture(),
    ...policyFixture(),
    ...tenantSeparationFixture(),
    ...dependsOnFixture(),
    ...dataProtectionRegimeFixture(),
    ...dataAccountExportFixture(),
    ...dctDescriptionFixture(),
    ...dcatKeywordFixture(),
    ...provisionTypeFixture(),
    ...gxEndpointFixture(),
    ...providedByFixture(did),
    ...aggregationOfFixture(),
    ...dependsOnFixture(),
    ...serviceOfferingLocationsFixture(),
    ...standardConformityFixture(),
  }
}

function createFileStorageOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:FileStorageOffering',
    'gax-trust-framework:fileSystem': "'FAT32', 'exFAT' or 'NTFS'",
  }
}

//todo: https://sd-creation-wizard.gxfs.dev/select-file has problem with this type
function createIdentityProviderSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
  }
}

function createOrchestrationSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:Orchestration',
    'gax-trust-framework:type': "'Docker Swarm', 'Apache Mesos' or 'Kubernetes'",
  }
}

function createBlockStorageOfferingSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
    '@type': 'gax-trust-framework:BlockStorageOffering',
    'gax-trust-framework:volumeTypes': {
      '@value': 'your volume types',
      '@type': 'xsd:string',
    },
  }
}

//todo: https://sd-creation-wizard.gxfs.dev/select-file has problem with this type
function createDigitalIdentityWalletSubject(did?: string) {
  return {
    ...getGeneralServiceOffering2210Subject(did),
  }
}

function termsAndConditionsFixture() {
  return {
    'gax-trust-framework:termsAndConditions': {
      '@type': 'gax-trust-framework:TermsAndConditions',
      'gax-trust-framework:content': {
        '@value': 'your terms and conditions content url *',
        '@type': 'xsd:anyURI',
      },
      'gax-trust-framework:hash': {
        '@value': 'your terms and conditions content hash *',
        '@type': 'xsd:string',
      },
    },
  }
}

function instantiationReqFixture() {
  return {
    'gax-trust-framework:instantiationReq': [
      {
        '@id': 'your instantiation req *',
      },
    ],
  }
}

function dctDescriptionFixture() {
  return {
    'dct:description': {
      '@value': 'your description of this Virtual Machine',
      '@type': 'xsd:string',
    },
  }
}

function createDcatDatasetSubject(url: string, did?: string) {
  return {
    '@context': {
      cc: 'http://creativecommons.org/ns#',
      schema: 'http://schema.org/',
      cred: 'https://www.w3.org/2018/credentials#',
      void: 'http://rdfs.org/ns/void#',
      owl: 'http://www.w3.org/2002/07/owl#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      'gax-validation': 'http://w3id.org/gaia-x/validation#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      voaf: 'http://purl.org/vocommons/voaf#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      vcard: 'http://www.w3.org/2006/vcard/ns#',
      'gax-core': 'http://w3id.org/gaia-x/core#',
      dct: 'http://purl.org/dc/terms/',
      sh: 'http://www.w3.org/ns/shacl#',
      'gax-trust-framework': 'http://w3id.org/gaia-x/gax-trust-framework#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      ids: 'https://w3id.org/idsa/core/',
      dcat: 'http://www.w3.org/ns/dcat#',
      vann: 'http://purl.org/vocab/vann/',
      foaf: 'http://xmlns.com/foaf/0.1/',
      did: 'https://www.w3.org/TR/did-core/#',
      adms: 'http://www.w3.org/ns/adms#',
    },
    ...dcatDataSetFixture(url, did),
    id: `${did ? did : 'your DID here'}`,
  }
}

function createDcatDataServiceSubject(url: string, did?: string) {
  return {
    '@context': {
      cc: 'http://creativecommons.org/ns#',
      schema: 'http://schema.org/',
      cred: 'https://www.w3.org/2018/credentials#',
      void: 'http://rdfs.org/ns/void#',
      owl: 'http://www.w3.org/2002/07/owl#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      'gax-validation': 'http://w3id.org/gaia-x/validation#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      voaf: 'http://purl.org/vocommons/voaf#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      vcard: 'http://www.w3.org/2006/vcard/ns#',
      'gax-core': 'http://w3id.org/gaia-x/core#',
      dct: 'http://purl.org/dc/terms/',
      sh: 'http://www.w3.org/ns/shacl#',
      'gax-trust-framework': 'http://w3id.org/gaia-x/gax-trust-framework#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      ids: 'https://w3id.org/idsa/core/',
      dcat: 'http://www.w3.org/ns/dcat#',
      vann: 'http://purl.org/vocab/vann/',
      foaf: 'http://xmlns.com/foaf/0.1/',
      did: 'https://www.w3.org/TR/did-core/#',
      adms: 'http://www.w3.org/ns/adms#',
    },
    ...dcatDataServiceFixture(url, did),
    id: `${did ? did : 'your DID here'}`,
  }
}

function dcatDataSetFixture(url: string, did?: string) {
  return {
    '@graph': [
      {
        '@id': '_:N2a4f48da451d4602880c4d1cd8fd52b6',
        '@type': 'vcard:Address',
        'vcard:country-name': 'Sweden',
        'vcard:locality': 'Stockholm',
        'vcard:postal-code': '11436',
        'vcard:street-address': 'Stureg. 14',
      },
      {
        '@id': `${url}/datasets/dcat#ds1`,
        '@type': 'dcat:Dataset',
        'adms:contactPoint': {
          '@id': `${url}/contacts/n1`,
        },
        'dcat:distribution': {
          '@id': `${url}/datasets/dcat#dist1`,
        },
        'dcat:keyword': ['Nobel prize', 'science', 'prize'],
        'dcat:landingPage': {
          '@id': `${url}`,
        },
        'dcat:theme': {
          '@id': 'http://eurovoc.europa.eu/100142',
        },
        'dct:accrualPeriodicity': {
          '@id': 'http://purl.org/cld/freq/daily',
        },
        'dct:conformsTo': {
          '@id': 'http://www.nobelprize.org/nobel_organizations/nobelmedia/nobelprize_org/developer/manual-linkeddata/terms.html',
        },
        'dct:description': 'This dataset contains Nobel prizes, Nobel laureates and information about related media resources. ',
        'dct:issued': '2014-01-15',
        'dct:language': {
          '@id': 'http://publications.europa.eu/resource/authority/language/ENG',
        },
        'dct:modified': '2014-08-27',
        'dct:publisher': {
          '@id': `${url}/publisher/n2`,
        },
        'dct:spatial': {
          '@id': 'http://sws.geonames.org/2673730',
        },
        'dct:temporal': {
          '@id': 'http://data.nobelprize.org/period',
        },
        'dct:title': {
          '@language': 'en',
          '@value': 'Linked Nobel prizes',
        },
      },
      {
        '@id': `${url}/publisher/n2`,
        '@type': 'foaf:Agent',
        'dct:type': {
          '@id': '_:Ne69579d666ed410a9c307f188d9ffd21',
        },
        'foaf:name': 'Nobel Media AB',
      },
      {
        '@id': `${url}/publisher/n0`,
        '@type': 'foaf:Agent',
        'dct:type': {
          '@id': 'http://purl.org/adms/publishertype/Company',
        },
        'foaf:name': 'Nobel Media AB',
      },
      {
        '@id': '_:N43230c0d821748bd881b4a5178ee0e39',
        '@type': ['vcard:Work', 'vcard:Voice'],
        'vcard:hasValue': {
          '@id': 'tel:086631722',
        },
      },
      {
        '@id': '_:Ne69579d666ed410a9c307f188d9ffd21',
        'dcat:keyword': 'http://purl.org/adms/publishertype/Company',
      },
      {
        '@id': 'http://data.nobelprize.org/period',
        '@type': 'dct:PeriodOfTime',
        'schema:endDate': {
          '@type': 'xsd:date',
          '@value': '2024-01-05',
        },
        'schema:startDate': {
          '@type': 'xsd:date',
          '@value': '2022-03-01',
        },
      },
      {
        '@id': `${url}/contacts/n1`,
        '@type': 'vcard:VCard',
        'vcard:fn': 'Nobel Media AB',
        'vcard:hasAddress': {
          '@id': '_:N2a4f48da451d4602880c4d1cd8fd52b6',
        },
        'vcard:hasEmail': {
          '@id': 'mailto:info@nobelmedia.org',
        },
        'vcard:hasTelephone': {
          '@id': '_:N43230c0d821748bd881b4a5178ee0e39',
        },
      },
      {
        '@id': 'http://sws.geonames.org/2673730',
        '@type': 'dct:Location',
        'rdfs:label': 'Stockholm',
      },
    ],
  }
}

function dcatDataServiceFixture(url: string, did?: string) {
  return {
    '@graph': [
      {
        '@context': ['http://www.w3.org/ns/dcat#', 'http://purl.org/dc/terms/'],
        '@type': 'DataService',
        '@id': `${url}/dataservice`,
        'dct:title': 'Example Data Service',
        'dct:description':
          'The endpoint description gives specific details of the actual endpoint instances, while dct:conformsTo is used to indicate the general standard or specification that the endpoints implement.\n',
        'dct:keyword': ['example', 'data', 'service'],
        'dct:theme': [
          {
            '@id': `${url}/themes/theme1`,
            title: 'Theme 1',
          },
          {
            '@id': `${url}/themes/theme2`,
            title: 'Theme 2',
          },
        ],
        'dct:homepage': `${url}/dataservice`,
        'dct:publisher': {
          '@type': 'Organization',
          name: 'Example Organization',
          url: `${url}/organization`,
        },
        'dct:contactPoint': {
          '@type': 'ContactPoint',
          name: 'Example Contact',
          email: 'contact@example.com',
          url: `${url}/contact`,
        },
        'dct:endpointURL': `${url}/dataservice/api`,
        'dct:endpointDescription': {
          '@type': 'EndpointDescription',
          '@id': `${url}/dataservice/api`,
          title: 'Example Data Service API',
          description: 'The root location or primary endpoint of the service (a Web-resolvable IRI).\n',
          conformsTo: {
            '@id': 'http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/core',
          },
          documentation: `${url}/dataservice/api/docs`,
          usesVocabulary: [
            {
              '@id': 'http://www.w3.org/ns/csvw',
            },
          ],
        },
        'dcat:servesDataset': [dcatDataSetFixture(url, did)],
        'dct:serviceType': [`${url}/service-types/type1`, `${url}/service-types/type2`],
        'dct:serviceStatus': 'http://purl.org/adms/status/Released',
        'dct:accessRights': {
          '@id': `${url}/access-rights/public`,
          title: 'Public Access',
        },
        'dct:license': {
          '@id': 'https://creativecommons.org/licenses/by/4.0/',
          title: 'Creative Commons Attribution 4.0 International',
        },
        'dct:hasPolicy': {
          '@type': 'Policy',
          '@id': `${url}/dataservice/policy`,
          title: 'Example Data Service Policy',
          description: 'This is the policy for the Example Data Service.',
          issued: '2022-01-01T00:00:00Z',
          language: 'en',
          rights: 'http://creativecommons.org/licenses/by/4.0/',
          accessRights: {
            '@id': `${url}/access-rights/public`,
            title: 'Public Access',
          },
          conformsTo: [
            {
              '@id': 'https://www.iso.org/standard/71670.html',
            },
          ],
        },
        'dct:provenance': [
          {
            '@type': 'ProvenanceStatement',
            description: 'The data in this service was generated by Example Organization.',
            generatedBy: {
              '@type': 'Organization',
              name: 'Example Organization',
              url: `${url}/organization`,
            },
          },
        ],
      },
    ],
  }
}

function tenantSeparationFixture() {
  return {
    'gax-trust-framework:tenantSeparation': {
      '@value': 'your tenant separation (default value: hw-virtualized)',
      '@type': 'xsd:string',
    },
  }
}

function dcatKeywordFixture() {
  return {
    'dcat:keyword': {
      '@value': 'your list of keywords',
      '@type': 'xsd:string',
    },
  }
}

function providedByFixture(did?: string) {
  return {
    'gax-trust-framework:providedBy': {
      '@id': `${did ? did : 'Your did here *'}`,
    },
  }
}

function dataAccountExportFixture() {
  return {
    'gax-trust-framework:dataAccountExport': {
      '@type': 'gax-trust-framework:DataAccountExport',
      'gax-trust-framework:requestType': {
        '@value': 'your request type *',
        '@type': 'xsd:string',
      },
      'gax-trust-framework:accessType': {
        '@value': 'your access type *',
        '@type': 'xsd:string',
      },
      'gax-trust-framework:formatType': {
        '@value': 'you format type *',
        '@type': 'xsd:string',
      },
    },
  }
}

function contractsFixture() {
  return {
    'trusted-cloud:contracts': {
      '@id': 'your contracts *',
    },
  }
}

function trustedCloudSecurityFixture() {
  return {
    'trusted-cloud:security': {
      '@id': 'your security *',
    },
    'trusted-cloud:dataProtection': {
      '@id': 'your data protection *',
    },
    'trusted-cloud:operativeProcesses': {
      '@id': 'your operative processes *',
    },
    'trusted-cloud:interoperability': {
      '@id': 'your interoperability *',
    },
    'trusted-cloud:serviceArchitecture': {
      '@id': 'your service architecture *',
    },
  }
}

function aggregationOfFixture() {
  return {
    'gax-core:aggregationOf': {
      '@id': 'your ServiceOffering is an aggregation of these',
    },
  }
}

function dependsOnFixture() {
  return {
    'gax-core:dependsOn': {
      '@id': 'a did which this ServiceOffering is dependant on',
    },
  }
}

function mainContactFixture() {
  return {
    'trusted-cloud:mainContact': {
      '@type': 'vcard:Agent',
      'vcard:given-name': {
        '@value': 'contact first name *',
        '@type': 'xsd:string',
      },
      'vcard:family-name': {
        '@value': 'contact family name *',
        '@type': 'xsd:string',
      },
      'vcard:nickname': {
        '@value': 'contact nickname',
        '@type': 'xsd:string',
      },
      'vcard:position': {
        '@value': 'contact position',
        '@type': 'xsd:string',
      },
      'vcard:email': {
        '@value': 'contact email *',
        '@type': 'xsd:anyURI',
      },
      'vcard:tel': {
        '@value': 'contact tel *',
        '@type': 'xsd:string',
      },
      'vcard:image': {
        '@value': 'contact image',
        '@type': 'xsd:string',
      },
      'vcard:address': {
        '@value': 'contact address',
        '@type': 'xsd:string',
      },
    },
  }
}

function additionalContactFixture() {
  return {
    'trusted-cloud:AdditionalContact': {
      '@type': 'vcard:Agent',
    },
  }
}

function subcontractorsFixture() {
  return {
    'trusted-cloud:subContractors': {
      '@id': 'your subcontractors',
    },
  }
}

function certificatesFixture() {
  return {
    'trusted-cloud:certificates': {
      '@type': 'trusted-cloud:CertificateScope',
      'trusted-cloud:certificate': {
        '@id': 'your certificate *',
      },
      'trusted-cloud:scope': {
        '@value': 'relevenace of certificate for this scope *',
        '@type': 'xsd:string',
      },
    },
  }
}

function dataCentresFixture() {
  return {
    'trusted-cloud:dataCentres': {
      '@id': 'your data centres',
    },
  }
}

function offeredByFixture(did?: string) {
  return {
    'gax-core:offeredBy': [
      {
        '@id': `${did ? did : 'your DID here'}`,
      },
    ],
  }
}

function cloudGeneralInformationFixture() {
  return {
    'trusted-cloud:generalInformation': {
      '@type': 'trusted-cloud:GeneralInformationService',
      'trusted-cloud:name': {
        '@value': 'your service name *',
        '@type': 'xsd:string',
      },
      'trusted-cloud:serviceLogo': {
        '@value': 'your service logo',
        '@type': 'xsd:anyURI',
      },
      'trusted-cloud:provisionType': "'private', 'public' or 'hybrid' *",
      'trusted-cloud:serviceModel': "'Iaas', 'Paas' or 'SaaS' *",
      'trusted-cloud:website': {
        '@value': 'your service website *',
        '@type': 'xsd:anyURI',
      },
    },
  }
}

function cloudFunctionalDescriptionFixture() {
  return {
    'trusted-cloud:functionalDescription': {
      '@type': 'trusted-cloud:FunctionalDescriptionService',
      'trusted-cloud:description': {
        '@value': 'functional description',
        '@type': 'xsd:string',
      },
      'trusted-cloud:briefDescription': {
        '@value': 'functional brief description',
        '@type': 'xsd:string',
      },
    },
  }
}

function gxConnectionFixture() {
  return {
    'gax-trust-framework:CircuitType': {
      '@value': "'wired medium access' or 'wireless medium access'",
      '@type': 'xsd:string',
    },
    'gax-trust-framework:InterfaceType': {
      '@value': 'your interface type',
      '@type': 'xsd:string',
    },
    'gax-trust-framework:SourceAccessPoint': {
      '@value': 'your source accesspoint',
      '@type': 'xsd:string',
    },
    'gax-trust-framework:DestinationAccessPoint': {
      '@value': 'your destination accesspoint',
      '@type': 'xsd:string',
    },
  }
}

function instantiationRequirementsFixture() {
  return {
    'gax-trust-framework:InstantiationRequirements': {
      '@value': 'your instantiation req',
      '@type': 'xsd:string',
    },
  }
}

function resourceLimitsFixture() {
  return {
    'gax-trust-framework:resourceLimits': {
      '@id': 'all container resource limits *',
    },
  }
}

function vlanEtherTypeFixture() {
  return {
    'gax-trust-framework:vlanEtherType': {
      '@value': 'your vlan ether type',
      '@type': 'xsd:string',
    },
  }
}

function gxMeasureFixture() {
  return {
    '@type': 'gax-trust-framework:Measure',
    'gax-trust-framework:value': {
      '@value': 'value *',
      '@type': 'xsd:float',
    },
    'gax-trust-framework:unit': {
      '@value': 'unit *',
      '@type': 'xsd:string',
    },
  }
}

function gxAvailabilityFixture() {
  return {
    'gax-trust-framework:availability': gxMeasureFixture(),
  }
}

function gxPacketLossFixture() {
  return {
    'gax-trust-framework:packetLoss': gxMeasureFixture(),
  }
}

function gxJitterFixture() {
  return {
    'gax-trust-framework:jitter': gxMeasureFixture(),
  }
}

function gxVlanTypeFixture() {
  return {
    'gax-trust-framework:vlanType': {
      '@value': 'your vlan type',
      '@type': 'xsd:string',
    },
  }
}

function gxVlanTagFixture() {
  return {
    'gax-trust-framework:vlanTag': gxMeasureFixture(),
  }
}

function gxBandwidthFixture() {
  return {
    'gax-trust-framework:bandwidth': gxMeasureFixture(),
  }
}

function serviceOfferingNameFixture() {
  return {
    'gax-trust-framework:name': {
      '@value': 'your service name *',
      '@type': 'xsd:string',
    },
  }
}

function imageFixture() {
  return {
    'gax-trust-framework:image': {
      '@id': 'all your container images *',
    },
  }
}

function dataProtectionRegimeFixture() {
  return {
    'gax-trust-framework:dataProtectionRegime': {
      '@value': 'data protection regime list',
      '@type': 'xsd:string',
    },
  }
}

function gxEndpointFixture() {
  return {
    'gax-trust-framework:endpoint': {
      '@type': 'gax-trust-framework:Endpoint',
      'gax-trust-framework:endPointURL': {
        '@value': 'your endpoint url',
        '@type': 'xsd:anyURI',
      },
      ...standardConformityFixture(),
      'gax-trust-framework:endpointDescription': {
        '@value': 'your endpoint description',
        '@type': 'xsd:anyURI',
      },
    },
  }
}

function serviceOfferingLocationsFixture() {
  return {
    'gax-trust-framework:ServiceOfferingLocations': {
      '@value': 'your ServiceLocation',
      '@type': 'xsd:string',
    },
  }
}

function provisionTypeFixture() {
  return {
    'gax-trust-framework:provisionType': {
      '@value': 'your service provisiontype',
      '@type': 'xsd:string',
    },
  }
}

function standardConformityFixture() {
  return {
    'gax-trust-framework:standardConformity': {
      '@type': 'gax-trust-framework:Standard',
      'gax-trust-framework:title': {
        '@value': 'your standard name *',
        '@type': 'xsd:string',
      },
      'gax-trust-framework:standardReference': {
        '@value': 'your standard reference (url) *',
        '@type': 'xsd:anyURI',
      },
      'gax-trust-framework:publisher': {
        '@value': 'publisher of your standard',
        '@type': 'xsd:string',
      },
    },
  }
}

function codeArtifactFixture() {
  return {
    'gax-trust-framework:codeArtifact': [
      {
        '@id': 'your code artifact *',
      },
    ],
  }
}

function policyFixture() {
  return {
    'gax-trust-framework:policy': {
      '@value': 'your policy list here *',
      '@type': 'xsd:string',
    },
  }
}
