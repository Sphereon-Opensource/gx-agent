import { GaiaxComplianceClient, GXPluginMethodMap, IGaiaxCredentialType } from '../src'
import { BlsKeyManagementSystem } from '@sphereon/ssi-sdk-bls-kms-local/dist/BlsKeyManagementSystem'
import * as u8a from 'uint8arrays'
import {
  CredentialHandlerLDLocal,
  LdDefaultContexts,
  MethodNames,
  SphereonEd25519Signature2018,
  SphereonEd25519Signature2020,
} from '@sphereon/ssi-sdk-vc-handler-ld-local'
import { CredentialIssuer } from '@veramo/credential-w3c'
import { KeyManager, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { ContextDoc } from '@sphereon/ssi-sdk-vc-handler-ld-local/dist/types/types'
import { exampleV1, gxShape } from './schemas'
import { participantDid } from './mocks'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { createAgent, TAgent } from '@veramo/core'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { WebDIDProvider } from '@veramo/did-provider-web'
import { ICredentialSubject } from '@sphereon/ssi-types'
// @ts-ignore
import nock from 'nock'
import { DataStore, DataStoreORM, Entities, KeyStore, PrivateKeyStore } from '@veramo/data-store'
import { DataSource } from 'typeorm'
// @ts-ignore
import fs from 'fs'

const customContext = new Map<string, ContextDoc>([
  [`https://www.w3.org/2018/credentials/examples/v1`, exampleV1],
  ['https://registry.gaia-x.eu/v2206/api/shape', gxShape as unknown as ContextDoc],
])

describe('@sphereon/gx-compliance-client', () => {
  let agent: TAgent<GXPluginMethodMap>
  let dbConnection: Promise<DataSource>
  const databaseFile = './tmp/test-db2.sqlite'
  const DB_ENCRYPTION_KEY = '12739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830a'

  beforeEach(async () => {
    await (await dbConnection).dropDatabase()
    await (await dbConnection).synchronize()
  })

  afterAll(async () => {
    ;(await dbConnection).close()
    fs.unlinkSync(databaseFile)
  })

  beforeAll(async () => {
    nock('https://participant')
      .get(`/.well-known/did.json`)
      .times(3)
      .reply(200, {
        ...participantDid,
      })

    dbConnection = new DataSource({
      type: 'sqlite',
      database: databaseFile,
      entities: Entities,
    }).initialize()

    agent = createAgent<GXPluginMethodMap>({
      plugins: [
        new KeyManager({
          store: new KeyStore(dbConnection),
          kms: {
            local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY))),
          },
        }),
        new DIDManager({
          providers: {
            'did:web': new WebDIDProvider({ defaultKms: 'local' }),
          },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:web',
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
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
        new GaiaxComplianceClient({
          participantUrl: 'http://participant',
          participantDid: 'did:web:participant',
          complianceServiceVersion: 'v2206',
          complianceServiceUrl: 'http://compliance',
        }),
      ],
    })
  })

  it.skip('should create a VC', async () => {
    await agent.issueVerifiableCredential({
      customContext: 'https://registry.gaia-x.eu/v2206/api/shape',
      keyRef: 'test',
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
      } as unknown as ICredentialSubject,
      type: IGaiaxCredentialType.LegalPerson,
      verificationMethodId: 'did:web:participant#JWK2020-RSA',
    })
  })

  it('should create rsa keys', async () => {
    const kms = new BlsKeyManagementSystem(new MemoryPrivateKeyStore())
    const key = await kms.createKey({ type: 'RSA' })
    expect(key.type).toEqual('RSA')
    expect(key.publicKeyHex.length).toBeGreaterThan(320)
    expect(key.kid).toBeDefined()
    expect(key.meta?.algorithms).toEqual(['RS256', 'RS512'])
    expect(key.meta?.publicKeyPEM).toBeDefined()
  })

  it('should sign with created rsa keys (read from kms)', async () => {
    const kms = new BlsKeyManagementSystem(new MemoryPrivateKeyStore())
    const key = await kms.createKey({ type: 'RSA' })
    expect(key.type).toEqual('RSA')
    expect(key.publicKeyHex.length).toBeGreaterThan(320)
    expect(key.kid).toBeDefined()
    expect(key.meta?.algorithms).toEqual(['RS256', 'RS512'])
    expect(key.meta?.publicKeyPEM).toBeDefined()

    const data = u8a.fromString('test', 'utf-8')

    const kid = key.kid
    // @ts-ignore
    const signature = await kms.sign({ keyRef: { kid }, data, algorithm: 'RS256' })
    console.log(signature)
  })
})
