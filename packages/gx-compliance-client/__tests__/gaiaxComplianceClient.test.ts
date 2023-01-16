import { GXPluginMethodMap, IGaiaxCredentialType } from '../src'
import { ContextDoc } from '@sphereon/ssi-sdk-vc-handler-ld-local/dist/types/types'
import { exampleV1, gxShape } from './schemas'
import { mockedDID } from './mocks'
import { IIdentifier, TAgent } from '@veramo/core'
// @ts-ignore
import nock from 'nock'
import { DataSource } from 'typeorm'
// @ts-ignore
import fs from 'fs'
import { PEM_CERT, PEM_CHAIN, PEM_PRIV_KEY } from './certs'
import { createDatabase, dropDatabase, setupAgent } from './commonTest'
import { X509Opts } from '@sphereon/ssi-sdk-did-utils'

const customContext = new Map<string, ContextDoc>([
  [`https://www.w3.org/2018/credentials/examples/v1`, exampleV1],
  //fixme: The below can't be right
  ['https://registry.gaia-x.eu/v2206/api/shape', gxShape as unknown as ContextDoc],
])

describe('@sphereon/gx-compliance-client', () => {
  let agent: TAgent<GXPluginMethodMap>
  let dbConnection: Promise<DataSource>
  const databaseFile = './tmp/test-db2.sqlite'
  const DB_ENCRYPTION_KEY = '12739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830a'
  let identifier: IIdentifier

  const x509: X509Opts = {
    cn: 'f825-87-213-241-251.eu.ngrok.io',
    certificatePEM: PEM_CERT,
    certificateChainPEM: PEM_CHAIN,
    privateKeyPEM: PEM_PRIV_KEY,
    certificateChainURL: 'https://f825-87-213-241-251.eu.ngrok.io/.well-known/fullchain.pem',
  }

  beforeEach(async () => {
    await createDatabase(dbConnection)
    nock.cleanAll()
    nock('https://f825-87-213-241-251.eu.ngrok.io')
      .get(`/.well-known/did.json`)
      .times(60)
      .reply(200, {
        ...mockedDID,
      })
    nock('https://f825-87-213-241-251.eu.ngrok.io').get(`/.well-known/fullchain.pem`).times(3).reply(200, PEM_CHAIN)

    identifier = await agent.createDIDFromX509({
      domain: x509.cn!,
      certificatePEM: x509.certificatePEM!,
      certificateChainPEM: x509.certificateChainPEM!,
      certificateChainURL: x509.certificateChainURL!,
      privateKeyPEM: x509.privateKeyPEM!,
      kid: 'test',
    })
  })

  afterAll(async () => {
    nock.cleanAll()
    await dropDatabase(dbConnection, databaseFile)
  })

  beforeAll(async () => {
    const agentSetup = await setupAgent({ dbFile: databaseFile, dbEncryptionKey: DB_ENCRYPTION_KEY, customContext })
    dbConnection = agentSetup.dbConnection
    agent = agentSetup.agent
  })

  it('should create a VC, VP and verify them', async () => {
    console.log(JSON.stringify(mockedDID, null, 2))
    const uniqueVC = await agent.issueVerifiableCredential({
      keyRef: 'test',
      credential: {
        issuer: `${identifier.did}`,
        id: '3d17bb21-40d8-4c82-8468-fa11dfa8617c',
        credentialSubject: {
          id: identifier.did,
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://registry.gaia-x.eu/v2206/api/shape'],

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
        type: [IGaiaxCredentialType.LegalPerson],
      },
    })
    console.log(JSON.stringify(uniqueVC, null, 2))

    const vcResult = await agent.verifyCredentialLDLocal({ credential: uniqueVC.verifiableCredential, fetchRemoteContexts: true })
    console.log(vcResult)

    const verifiablePresentation = await agent.issueVerifiablePresentation({
      keyRef: 'test',
      verifiableCredentials: [uniqueVC.verifiableCredential],
      verificationMethodId: `${identifier.did}#test`,
    })
    console.log(JSON.stringify(verifiablePresentation, null, 2))

    const resultvp = await agent.checkVerifiablePresentation({ verifiablePresentation })
    console.log(resultvp)
  })
})
