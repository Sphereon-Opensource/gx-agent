import { GXPluginMethodMap } from '../src'
import * as u8a from 'uint8arrays'
import { mockedDID } from './mocks'
import { KeyManagementSystem } from '@veramo/kms-local'
import { TAgent } from '@veramo/core'
// @ts-ignore
import nock from 'nock'
import { DataSource } from 'typeorm'
// @ts-ignore
import fs from 'fs'
import { createDatabase, dropDatabase, setupAgent } from './commonTest'
import { PEM_CERT, PEM_CHAIN, PEM_PRIV_KEY } from './certs'
import { privateKeyHexFromPEM, X509Opts } from '@sphereon/ssi-sdk-did-utils'

describe('@sphereon/gx-agent DID support', () => {
  let agent: TAgent<GXPluginMethodMap>
  let dbConnection: Promise<DataSource>
  let kms: KeyManagementSystem
  const databaseFile = './tmp/did-test.sqlite'
  const DB_ENCRYPTION_KEY = '12739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830a'

  const x509: X509Opts = {
    cn: 'f825-87-213-241-251.eu.ngrok.io',
    certificatePEM: PEM_CERT,
    certificateChainPEM: PEM_CHAIN,
    privateKeyPEM: PEM_PRIV_KEY,
    certificateChainURL: 'https://f825-87-213-241-251.eu.ngrok.io/.well-known/fullchain.pem',
  }
  const privateKeyHex = privateKeyHexFromPEM(PEM_PRIV_KEY)
  const meta = {
    x509,
  }

  beforeEach(async () => {
    await createDatabase(dbConnection)
    nock.cleanAll()
    nock('https://f825-87-213-241-251.eu.ngrok.io')
      .get(`/.well-known/did.json`)
      .times(3)
      .reply(200, {
        ...mockedDID,
      })
    nock('https://f825-87-213-241-251.eu.ngrok.io').get(`/.well-known/fullchain.pem`).times(3).reply(200, PEM_CHAIN)
  })

  afterAll(async () => {
    nock.cleanAll()
    await dropDatabase(dbConnection, databaseFile)
  })

  beforeAll(async () => {
    const agentSetup = await setupAgent({ dbFile: databaseFile, dbEncryptionKey: DB_ENCRYPTION_KEY })
    dbConnection = agentSetup.dbConnection
    kms = agentSetup.kms
    agent = agentSetup.agent
  })

  it('should create rsa keys', async () => {
    const key = await kms.createKey({ type: 'RSA' })
    expect(key.type).toEqual('RSA')
    expect(key.publicKeyHex.length).toBeGreaterThan(320)
    expect(key.kid).toBeDefined()
    expect(key.meta?.algorithms).toEqual(['RS256', 'RS512', 'PS256', 'PS512'])
    expect(key.meta?.publicKeyPEM).toBeDefined()
  })

  it('should sign with created rsa keys (read from kms)', async () => {
    const key = await kms.createKey({ type: 'RSA' })
    expect(key.type).toEqual('RSA')
    expect(key.publicKeyHex.length).toBeGreaterThan(320)
    expect(key.kid).toBeDefined()
    expect(key.meta?.algorithms).toEqual(['RS256', 'RS512', 'PS256', 'PS512'])
    expect(key.meta?.publicKeyPEM).toBeDefined()

    const data = u8a.fromString('test', 'utf-8')

    const kid = key.kid
    const signature = await kms.sign({ keyRef: { kid }, data, algorithm: 'RS256' })
    console.log(`signature: ${signature}`)
    expect(signature.length).toBeGreaterThan(10)
  })

  it('should import a cert with chain using the KMS directly', async () => {
    // @ts-ignore
    const key = await kms.importKey({ kid: 'test', privateKeyHex, type: 'RSA', meta })
    expect(key.type).toEqual('RSA')
    expect(key.publicKeyHex).toEqual(
      '30820122300d06092a864886f70d01010105000382010f003082010a0282010100d5eb1f8708914a91581b7945b2f620963859b5279bcd9db3830cc6ac1cf8e9f26ecf8f6cc1a9d914b099fad9c4c4360008d1be9507f893b6ac32a5d6144314da8c4867526ffd15e41ff2f8fc0b7e0e23cf343de8607af88242b0a55ab2f38c371c12fa105522adcfc0356337374aabb0f2e41f14a56a3c20cacba9d58e14de0c78fdb710494dfa261fe5981e90f7b2e9915eedc6079c59406c02e87db772b689a55d51c370ffcfb9c596a960f40419c129e3bc8f8b1389d92997a68476893a6f64ae19372177271a8a420da9189a956d5a2fb614b07714243aa176d686d077a22225cbc39a71d2c4ba3a0e21c1198118c493bcdcf4a44d8dd7ca1ef264c024530203010001'
    )
    expect(key.kid).toEqual('test')
    expect(key.meta?.algorithms).toEqual(['RS256', 'RS512', 'PS256', 'PS512'])

    expect(key.meta?.publicKeyPEM).toBeDefined()
    await expect(key.meta?.publicKeyJwk).toMatchObject({
      kty: 'RSA',
      n: '1esfhwiRSpFYG3lFsvYgljhZtSebzZ2zgwzGrBz46fJuz49swanZFLCZ-tnExDYACNG-lQf4k7asMqXWFEMU2oxIZ1Jv_RXkH_L4_At-DiPPND3oYHr4gkKwpVqy84w3HBL6EFUirc_ANWM3N0qrsPLkHxSlajwgysup1Y4U3gx4_bcQSU36Jh_lmB6Q97LpkV7txgecWUBsAuh9t3K2iaVdUcNw_8-5xZapYPQEGcEp47yPixOJ2SmXpoR2iTpvZK4ZNyF3JxqKQg2pGJqVbVovthSwdxQkOqF21obQd6IiJcvDmnHSxLo6DiHBGYEYxJO83PSkTY3Xyh7yZMAkUw',
      e: 'AQAB',
      x5u: 'https://f825-87-213-241-251.eu.ngrok.io/.well-known/fullchain.pem',
    })
  })

  it('should import a cert, creating a DID:web using the GX agent client', async () => {
    const identifier = await agent.createDIDFromX509({
      domain: x509.cn!,
      certificatePEM: x509.certificatePEM!,
      certificateChainPEM: x509.certificateChainPEM!,
      certificateChainURL: x509.certificateChainURL!,
      privateKeyPEM: x509.privateKeyPEM!,
      kid: 'test',
    })
    expect(identifier.did).toEqual(`did:web:${x509.cn!}`)
    expect(identifier.controllerKeyId).toEqual('test')
    console.log(JSON.stringify(identifier, null, 2))
    const key = identifier.keys[0]!
    expect(key.publicKeyHex).toEqual(
      '30820122300d06092a864886f70d01010105000382010f003082010a0282010100d5eb1f8708914a91581b7945b2f620963859b5279bcd9db3830cc6ac1cf8e9f26ecf8f6cc1a9d914b099fad9c4c4360008d1be9507f893b6ac32a5d6144314da8c4867526ffd15e41ff2f8fc0b7e0e23cf343de8607af88242b0a55ab2f38c371c12fa105522adcfc0356337374aabb0f2e41f14a56a3c20cacba9d58e14de0c78fdb710494dfa261fe5981e90f7b2e9915eedc6079c59406c02e87db772b689a55d51c370ffcfb9c596a960f40419c129e3bc8f8b1389d92997a68476893a6f64ae19372177271a8a420da9189a956d5a2fb614b07714243aa176d686d077a22225cbc39a71d2c4ba3a0e21c1198118c493bcdcf4a44d8dd7ca1ef264c024530203010001'
    )
    expect(key.kid).toEqual('test')
    expect(key.meta?.algorithms).toEqual(['RS256', 'RS512', 'PS256', 'PS512'])

    expect(key.meta?.publicKeyPEM).toBeDefined()
    await expect(key.meta?.publicKeyJwk).toMatchObject({
      kty: 'RSA',
      n: '1esfhwiRSpFYG3lFsvYgljhZtSebzZ2zgwzGrBz46fJuz49swanZFLCZ-tnExDYACNG-lQf4k7asMqXWFEMU2oxIZ1Jv_RXkH_L4_At-DiPPND3oYHr4gkKwpVqy84w3HBL6EFUirc_ANWM3N0qrsPLkHxSlajwgysup1Y4U3gx4_bcQSU36Jh_lmB6Q97LpkV7txgecWUBsAuh9t3K2iaVdUcNw_8-5xZapYPQEGcEp47yPixOJ2SmXpoR2iTpvZK4ZNyF3JxqKQg2pGJqVbVovthSwdxQkOqF21obQd6IiJcvDmnHSxLo6DiHBGYEYxJO83PSkTY3Xyh7yZMAkUw',
      e: 'AQAB',
      x5u: 'https://f825-87-213-241-251.eu.ngrok.io/.well-known/fullchain.pem',
    })
  })
})
