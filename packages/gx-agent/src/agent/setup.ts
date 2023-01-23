import { GXComplianceClient } from './GXComplianceClient'
import { BlsKeyManagementSystem } from '@sphereon/ssi-sdk-bls-kms-local/dist/BlsKeyManagementSystem'
import { CredentialHandlerLDLocal, LdDefaultContexts, MethodNames } from '@sphereon/ssi-sdk-vc-handler-ld-local'
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
// @ts-ignore
import fs from 'fs'
import yaml from 'yaml'
import { ContextDoc } from '@sphereon/ssi-sdk-vc-handler-ld-local/dist/types/types'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { GXPluginMethodMap, IGaiaxComplianceConfig } from '../types'
import { GXJsonWebSignature2020 } from '../suites/GXJsonWebSignature2020'
import { getAgentConfigPath } from '../utils/config-utils'

export let globalConfig: any

export async function setupGXAgent(opts: {
  dbFile?: string
  dbConnection?: Promise<DataSource>
  dbEncryptionKey: string
  customContext?: Map<string, ContextDoc>
  config?: IGaiaxComplianceConfig
}) {
  if (!opts.dbConnection && !opts.dbFile) {
    throw Error('Either a db connection or dbFile needs to be supplied. None given')
  }
  const dbConnection: Promise<DataSource> = opts.dbConnection ? opts.dbConnection : newDBConnection(opts.dbFile!)

  const privateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(opts.dbEncryptionKey))
  const kmsName = opts.config?.kmsName ? opts.config.kmsName : 'local'
  const kms = new BlsKeyManagementSystem(privateKeyStore)
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
          // We test the verify methods by using the LDLocal versions directly in the tests
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

export const getConfig = (fileName: string): any => {
  if (!fs.existsSync(fileName)) {
    console.log('Config file not found: ' + fileName)
    // fixme: We should provide an example file and provide rename/copy instructions here, as veramo _config create will never create a valid GX _config
    console.log('Use "veramo _config create" to create one')
    process.exit(1)
  }

  const config = yaml.parse(fs.readFileSync(fileName).toString(), { prettyErrors: true })

  if (config?.version != 3) {
    console.log('Unsupported configuration file version:', config.version)
    process.exit(1)
  }
  if (!config.gx) {
    console.log(`No Gaia-X config options found in gx section from ${fileName}`)
    process.exit(1)
  }
  return config
}

export type ConfiguredAgent = TAgent<GXPluginMethodMap>

export async function getAgent(opts?: { path?: string }): Promise<ConfiguredAgent> {
  const path = opts?.path ? opts.path : getAgentConfigPath()
  try {
    const config = getConfig(path)

    if (!config.gx.dbEncryptionKey) {
      // todo: help user how to change the encryption key
      console.log(`Warning: default database encryption key is used`)
    }
    const dbEncryptionKey = config.gx.dbEncryptionKey ? config.gx.dbEncryptionKey : 'CHANGEME'
    const dbFile = config.gx.dbFile ? config.gx.dbFile : './db/gx.db.sqlite'
    globalConfig = config

    // console.log(JSON.stringify(config.gx, null, 2))
    return await (
      await setupGXAgent({ dbEncryptionKey, dbFile, config: config.gx })
    ).agent
    // return createAgentFromConfig<GXPluginMethodMap>(getConfig(fileName ? fileName : 'agent.yml'))
  } catch (e: any) {
    console.log('Unable to create agent from ' + path + '.', e.message)
    process.exit(1)
  }
}