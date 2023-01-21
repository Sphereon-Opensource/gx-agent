import { Command } from 'commander'
import { Entities } from '@veramo/data-store'
// @ts-ignore
import nock from 'nock'
import { DataSource } from 'typeorm'
// @ts-ignore
import fs from 'fs'
import { PEM_CHAIN } from '../../gx-agent/__tests__/certs'
import { asDID, dropDatabase } from '@sphereon/gx-agent'
import { mockedDID } from '../../gx-agent/__tests__/mocks'
import '../lib/did'
import '../lib/participant'
import '../lib/ecosystem'

let cmd: Command

export async function newDBConnection(databaseFile: string): Promise<DataSource> {
  return await new DataSource({
    type: 'sqlite',
    database: databaseFile,
    entities: Entities,
  }).initialize()
}

describe('@gx-compliance did', () => {
  const databaseFile = './db/db.sqlite'

  beforeEach(async () => {
    cmd = new Command()
    // await createDatabase(dbConnection)
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
    const dbConnection: Promise<DataSource> = newDBConnection(databaseFile)
    await dropDatabase(dbConnection, databaseFile)
  })

  /*beforeAll(async () => {
    const agentSetup = await setupAgent({ dbFile: databaseFile, dbEncryptionKey: DB_ENCRYPTION_KEY })
    dbConnection = agentSetup.dbConnection
    kms = agentSetup.kms
    agent = agentSetup.agent
  })*/

  it('create, should import x509 certs', async () => {
    cmd.parse('node ../dist/bin/gx-participant.js did'.split(' '))

    // cmd.parse("node ../dist/bin/gx-participant.js did create --private-key-file ./fixtures/private-key.pem --cert-file ./fixtures/cert.pem --ca-chain-file ./fixtures/ca-chain.pem -d f825-87-213-241-251.eu.ngrok.io".split(" "))
  })

  it('should convert to did', () => {
    expect(asDID('did:web:test')).toEqual('did:web:test')
    expect(asDID('test')).toEqual('did:web:test')
    expect(asDID('http://test')).toEqual('did:web:test')
    expect(asDID('https://test')).toEqual('did:web:test')
    expect(asDID('https://test/123')).toEqual('did:web:test')
    expect(asDID('https://test?123')).toEqual('did:web:test')
    expect(asDID('https://test#123')).toEqual('did:web:test')
    expect(asDID('https://test:123')).toEqual('did:web:test:123') // Ports are allowed
  })
})
