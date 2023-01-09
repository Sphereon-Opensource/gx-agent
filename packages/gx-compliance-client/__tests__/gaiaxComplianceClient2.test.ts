import { participantDid } from './mocks'
import { MemoryPrivateKeyStore } from '@veramo/key-manager'
import { BlsKeyManagementSystem } from '@sphereon/ssi-sdk-bls-kms-local/dist/BlsKeyManagementSystem'
// @ts-ignore
import nock from 'nock'
import { Entities } from '@veramo/data-store'
import { DataSource } from 'typeorm'
// @ts-ignore
import fs from 'fs'

describe('@sphereon/gx-compliance-client', () => {
  let dbConnection: Promise<DataSource>
  const databaseFile = './tmp/test-db2.sqlite'

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
    const kms = new BlsKeyManagementSystem(new MemoryPrivateKeyStore())
    const key = await kms.createKey({ type: 'RSA' })
    expect(key.type).toEqual('RSA')
    expect(key.publicKeyHex.length).toBeGreaterThan(320)
    expect(key.kid).toBeDefined()
    expect(key.meta?.algorithms).toEqual(['RS256', 'RS512'])
    expect(key.meta?.publicKeyPEM).toBeDefined()
    await expect(key.meta?.publicKeyJwk).toMatchObject({
      kty: 'RSA',
      e: 'AQAB',
    })
    const importedKey = await kms.importKey({ kid: 'test', privateKeyHex: key.privateKeyHex, type: 'RSA' })
    expect(importedKey.type).toEqual('RSA')
    expect(importedKey.publicKeyHex).toEqual(
        '30819f300d06092a864886f70d010101050003818d00308189028181008f46d01b91eeb6fe7933b5426d82d08e725ebadfeb5b9897504c4e6d589a0f9dba88092343391ea05849f46f11d2f956c46824445ab2b8b019d9e54a3497dac562252ce57f2e698773ff12e6f930bebe1a2e0465bbaca5a3b5ed4775a013f472e5b49ab2987c5413143c4d414be07ce63a0b0e93a8de138bd46c340368cf305f0203010001'
    )
    expect(importedKey.kid).toEqual('test')
    expect(importedKey.meta?.algorithms).toEqual(['RS256', 'RS512'])

    expect(importedKey.meta?.publicKeyPEM).toBeDefined()
    await expect(importedKey.meta?.publicKeyJwk).toMatchObject({
      kty: 'RSA',
      e: 'AQAB',
    })
  })
})
