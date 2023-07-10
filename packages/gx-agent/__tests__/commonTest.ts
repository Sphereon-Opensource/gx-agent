import { GXComplianceClient, GXPluginMethodMap } from '../src'
import { SphereonKeyManagementSystem } from '@sphereon/ssi-sdk-ext.kms-local/dist/SphereonKeyManagementSystem'
import { CredentialHandlerLDLocal, LdDefaultContexts, MethodNames } from '@sphereon/ssi-sdk.vc-handler-ld-local'
import { CredentialPlugin } from '@veramo/credential-w3c'
import { KeyManager } from '@veramo/key-manager'
import { SecretBox } from '@veramo/kms-local'
import { createAgent } from '@veramo/core'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { WebDIDProvider } from '@veramo/did-provider-web'
import { DataStore, DataStoreORM, Entities, KeyStore, PrivateKeyStore } from '@veramo/data-store'
import { DataSource } from 'typeorm'
import { Resolver } from 'did-resolver'
import { getResolver } from 'web-did-resolver'
// @ts-ignore
import fs from 'fs'
import { ContextDoc } from '@sphereon/ssi-sdk.vc-handler-ld-local/dist/types/types'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { GXJsonWebSignature2020 } from '../src/suites/GXJsonWebSignature2020'

export async function setupAgent(opts: {
  dbFile?: string
  dbConnection?: Promise<DataSource>
  dbEncryptionKey: string
  customContext?: Map<string, ContextDoc>
}) {
  if (!opts.dbConnection && !opts.dbFile) {
    throw Error('Either a db connection or dbFile needs to be supplied. None given')
  }
  const dbConnection: Promise<DataSource> = opts.dbConnection ? opts.dbConnection : newDBConnection(opts.dbFile!)
  const privateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(opts.dbEncryptionKey))
  const kms = new SphereonKeyManagementSystem(privateKeyStore)
  const webResolver = getResolver()
  const keyStore = new KeyStore(dbConnection)
  const resolver = new Resolver({ ...webResolver })
  const agent = createAgent<GXPluginMethodMap>({
    plugins: [
      new KeyManager({
        store: keyStore,
        kms: {
          local: kms,
        },
      }),
      new DIDManager({
        providers: {
          'did:web': new WebDIDProvider({ defaultKms: 'local' }),
        },
        store: new MemoryDIDStore(),
        defaultProvider: 'did:web',
      }),
      new CredentialPlugin(),
      new CredentialHandlerLDLocal({
        keyStore: privateKeyStore,
        contextMaps: opts?.customContext ? [LdDefaultContexts, opts.customContext] : [LdDefaultContexts],
        suites: [new GXJsonWebSignature2020()],
        bindingOverrides: new Map([
          ['createVerifiableCredentialLD', MethodNames.createVerifiableCredentialLDLocal],
          ['createVerifiablePresentationLD', MethodNames.createVerifiablePresentationLDLocal],
          // We test the verify methods by using the LDLocal versions directly in the tests
        ]),
      }),
      new DataStore(dbConnection),
      new DataStoreORM(dbConnection),
      new GXComplianceClient({
        kmsName: 'local',
        complianceServiceVersion: 'v2206',
        complianceServiceUrl: 'http://localhost:3000',
      }),
      new DIDResolverPlugin({
        resolver,
      }),
    ],
  })
  return {
    agent,
    kms,
    dbConnection,
    resolver,
  }
}

export async function createDatabase(dbConnection: Promise<DataSource>) {
  await (await dbConnection).dropDatabase()
  await (await dbConnection).synchronize()
}

export async function dropDatabase(dbConnection: Promise<DataSource>, databaseFile: string) {
  await (await dbConnection).close()
  fs.unlinkSync(databaseFile)
}

export async function newDBConnection(databaseFile: string): Promise<DataSource> {
  return await new DataSource({
    type: 'sqlite',
    database: databaseFile,
    entities: Entities,
  }).initialize()
}
