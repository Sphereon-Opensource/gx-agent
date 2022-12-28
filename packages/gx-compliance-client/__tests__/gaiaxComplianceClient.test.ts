import { GaiaxComplianceClient } from '../src'
import {
  CredentialHandlerLDLocal,
  ICredentialHandlerLDLocal,
  LdDefaultContexts,
  MethodNames,
  SphereonEd25519Signature2018,
  SphereonEd25519Signature2020,
} from '@sphereon/ssi-sdk-vc-handler-ld-local'
import { CredentialIssuer, ICredentialIssuer } from '@veramo/credential-w3c'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { ContextDoc } from '@sphereon/ssi-sdk-vc-handler-ld-local/dist/types/types'
import { exampleV1, gxShape } from './mocks'
import { KeyManagementSystem } from '@veramo/kms-local'
import { getUniResolver } from '@sphereon/did-uni-client'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { createAgent, IDIDManager, IKeyManager, IResolver, TAgent } from '@veramo/core'
import { IGaiaxComplianceClient } from '../dist'
import { Resolver } from 'did-resolver'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
const customContext = new Map<string, ContextDoc>([
  [`https://www.w3.org/2018/credentials/examples/v1`, exampleV1],
  ['https://registry.gaia-x.eu/v2206/api/shape', gxShape as unknown as ContextDoc],
])

describe('@sphereon/gx-compliance-client', () => {
  let agent: TAgent<IResolver & IKeyManager & IDIDManager & ICredentialHandlerLDLocal & IGaiaxComplianceClient>

  beforeAll(async () => {
    /*agent = createAgent({
      plugins: [
        new KeyManager({
          store: new MemoryKeyStore(),
          kms: {
            local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
          },
        }),
        new DIDManager(),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...getUniResolver('web')
          })
        }),
        new CredentialIssuer(),
        new CredentialHandlerLDLocal({
          contextMaps: [LdDefaultContexts, customContext],
          suites: [new SphereonEd25519Signature2018(), new SphereonEd25519Signature2020()],
          bindingOverrides: new Map([
            // Bindings to test overrides of credential-ld plugin methods
            ['createVerifiableCredentialLD', MethodNames.createVerifiableCredentialLDLocal],
            ['createVerifiablePresentationLD', MethodNames.createVerifiablePresentationLDLocal],
            // We test the verify methods by using the LDLocal versions directly in the tests
          ]),
        }),
        new GaiaxComplianceClient({
          complianceServiceUrl: 'http://compliance',
          complianceServiceVersion: 'v2206',
          participantDid: 'did:web:participant',
          participantUrl: 'http://participant',
          credentialHandlerOptions: {
            contextMaps: [LdDefaultContexts, customContext],
            suites: [new SphereonEd25519Signature2018(), new SphereonEd25519Signature2020()],
          },
        })
      ],
    })*/
  })

  it('should create a VC', async () => {
    /*await agent.issueVerifiableCredential({
        customContext: 'https://registry.gaia-x.eu/v2206/api/shape',
        key: {
          privateKeyHex:
            '078c0f0eaa6510fab9f4f2cf8657b32811c53d7d98869fd0d5bd08a7ba34376b8adfdd44784dea407e088ff2437d5e2123e685a26dca91efceb7a9f4dfd81848',
          publicKeyHex: '8adfdd44784dea407e088ff2437d5e2123e685a26dca91efceb7a9f4dfd81848',
          kms: 'local',
          kid: `did:web:participant#sign`,
          type: 'Ed25519',
        },
        purpose: 'assertionMethod',
        subject: {
          id: '3d17bb21-40d8-4c82-8468-fa11dfa8617c',
          'gx-participant:name': 'OVH',
          'gx-participant:legalName': 'OVH',
          'gx-participant:website': 'https://participant',
          'gx-participant:registrationNumber': [
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
        type: 'LegalPerson',
        verificationMethodId: 'did:web:participant#JWK2020-RSA'
      })*/
  })
})
