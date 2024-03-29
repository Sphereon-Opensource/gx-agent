import { GXComplianceClient } from './GXComplianceClient.js'
import { SphereonKeyManagementSystem } from '@sphereon/ssi-sdk-ext.kms-local'
import { CredentialHandlerLDLocal, LdDefaultContexts, MethodNames } from '@sphereon/ssi-sdk.vc-handler-ld-local'
import { CredentialPlugin } from '@veramo/credential-w3c'
import { KeyManager } from '@veramo/key-manager'
import { SecretBox } from '@veramo/kms-local'
import { createAgent, TAgent } from '@veramo/core'
import { DIDManager } from '@veramo/did-manager'
import { WebDIDProvider } from '@veramo/did-provider-web'
import { DataStore, DataStoreORM, DIDStore, Entities, KeyStore, migrations, PrivateKeyStore } from '@veramo/data-store'
import { DataSource } from 'typeorm'
import { Resolver } from 'did-resolver'
import { getResolver } from 'web-did-resolver'
import fs from 'fs'
import { ContextDoc } from '@sphereon/ssi-sdk.vc-handler-ld-local/dist/types/types'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { GXPluginMethodMap, IGaiaxComplianceConfig } from '../types/index.js'
import { getAgentConfigPath, getConfigAsObject } from '../utils/index.js'
import { OrPromise } from '@veramo/utils'
import { GXJsonWebSignature2020 } from '../suites/index.js'

export let globalConfig: any

export async function setupGXAgent(opts: {
  dbFile?: string
  dbConnection?: OrPromise<DataSource>
  dbEncryptionKey: string
  customContext?: Map<string, ContextDoc>
  config?: IGaiaxComplianceConfig
}): Promise<ConfiguredAgent> {
  if (!opts.dbConnection && !opts.dbFile) {
    throw Error('Either a db connection or dbFile needs to be supplied. None given')
  }
  const dbConnection: OrPromise<DataSource> = opts.dbConnection ? opts.dbConnection : newDBConnection(opts.dbFile!)

  const privateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(opts.dbEncryptionKey))
  const kmsName = opts.config?.kmsName ? opts.config.kmsName : 'local'
  const kms = new SphereonKeyManagementSystem(privateKeyStore)
  const webResolver = getResolver()
  const keyStore = new KeyStore(dbConnection)

  const resolver = new Resolver({ ...webResolver })

  const agent = await createAgent<GXPluginMethodMap>({
    plugins: [
      new KeyManager({
        store: keyStore,
        kms: {
          [kmsName]: kms,
        },
      }),
      new DIDManager({
        providers: {
          'did:web': new WebDIDProvider({ defaultKms: kmsName }),
        },
        store: new DIDStore(dbConnection),
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
          ['verifyCredentialLD', MethodNames.verifyCredentialLDLocal],
          ['verifyPresentationLD', MethodNames.verifyPresentationLDLocal],
        ]),
      }),
      new DataStore(dbConnection),
      new DataStoreORM(dbConnection),
      new GXComplianceClient({
        kmsName: kmsName,
        complianceServiceVersion: opts.config?.complianceServiceVersion ?? 'v2206',
        complianceServiceUrl: opts.config?.complianceServiceUrl ?? 'http://localhost:3000',
      }),
      new DIDResolverPlugin({
        resolver,
      }),
    ],
  })

  return agent
}

export async function createDatabase(dbConnection: Promise<DataSource>) {
  await (await dbConnection).dropDatabase()
  await (await dbConnection).synchronize()
}

export async function dropDatabase(dbConnection: Promise<DataSource>, databaseFile: string) {
  await (await dbConnection).close()
  fs.unlinkSync(databaseFile)
}

async function newDBConnection(databaseFile: string): Promise<DataSource> {
  return await new DataSource({
    type: 'sqlite',
    database: databaseFile,
    entities: Entities,
    migrations: migrations,
    migrationsRun: true,
    logger: 'advanced-console',
  }).initialize()
}

export type ConfiguredAgent = TAgent<GXPluginMethodMap>

export async function getAgent(opts?: { path?: string }): Promise<ConfiguredAgent> {
  const path = opts?.path ? opts.path : getAgentConfigPath()
  try {
    const config = getConfigAsObject(path)

    if (!config.gx.dbEncryptionKey) {
      // todo: help user how to change the encryption key
      console.warn(`Warning: default database encryption key is used`)
    }
    const dbEncryptionKey = config.gx.dbEncryptionKey ? config.gx.dbEncryptionKey : 'CHANGEME'
    const dbFile = config.gx.dbFile ? config.gx.dbFile : './db/gx.db.sqlite'
    globalConfig = config

    // console.log(JSON.stringify(config.gx, null, 2))
    return await setupGXAgent({ dbEncryptionKey, dbFile, config: config.gx })
    // return createAgentFromConfig<GXPluginMethodMap>(getConfigAsObject(fileName ? fileName : 'agent.yml'))
  } catch (e: any) {
    console.error('Unable to create agent from ' + path + '.', e.message)
    process.exit(1)
  }
}
