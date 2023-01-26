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

describe('@sphereon/gx-agent', () => {
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

  it('should verify this VC', async () => {
    const vc = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'ParticipantCredential'],
      id: 'https://catalogue.gaia-x.eu/credentials/ParticipantCredential/1674487178632',
      issuer: 'did:web:20.238.163.4',
      issuanceDate: '2023-01-23T15:19:38.632Z',
      credentialSubject: {
        id: 'did:web:nk-gx-compliance.eu.ngrok.io',
        hash: '46345bec3ddac00a916a74053b1ae0b9df164b78814d966db3f4b03d0c0e3d1f',
      },
      proof: {
        type: 'JsonWebSignature2020',
        created: '2023-01-23T15:19:38.985Z',
        proofPurpose: 'assertionMethod',
        jws: 'eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..E7GDgeNiJYaBVUrXxaw3eZertivxd9zNObHcXwGTOl8ts7FIhdP4rc0rgFuI64iqoHuoa1v5gRmNtmVj29C93dTsUdlD7_sxVGZHiAGEW7zMeTkqB2Xv5GPGtfL2JHvyHhsqrpgVBs9v4bmDhTaowCVNzzf4D6VZkOaIdZM964ZpeClL019RG94d_d-wvCfqBE_NdB_DLVDxms46eU4DhT0oUonS-5bb_9agXnwT_Xr4L_nkniGdB0CdB9YY2nWaPhy8gPmGXdIgKyM-bpJGRpg2MDKbYJWpJ_Th1jBRrl-6nEh7NkvJYnTwmRku__4JYhgF5x8KzTddbH3edpr2XocZMah4jHQ29uIELq2V7c0DKnOsS-xg7RRBdPVgpia2YWppLF0eXTwrZTmdfdYTFqWqz0lH-LN1eYeTl64czbECLH7JgBmrY6bra_4vkKlXQz3xBUrjxFa9cIYeYCxsISPnB5KBPXhXdFbRUit3z9awWVPv4XmaC-kRt7loIjlH05SE5WqrR6PRgazf0UL6Cl6fW6ZPvNFPPTg2IrPR4HLGEgehw7m0j6umCOFcW_Nt8Xe7Amsi1mcjWb7k98WOOYnBo-3CIwS2lMdzvLLSz5jB62XmftZiKt7lQeSKMFCHy_OfQhj7LwOh7rf2HKwqMtT-OOytV85mwFUhhX7cjxQ',
        verificationMethod: 'did:web:20.238.163.4#X509-JWK2020',
      },
    }
    expect(await agent.verifyCredentialLDLocal({ credential: vc, fetchRemoteContexts: true })).toBeTruthy()
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

    const vcResult = await agent.verifyCredentialLDLocal({
      credential: uniqueVC.verifiableCredential,
      fetchRemoteContexts: true,
    })
    console.log(vcResult)

    /* const uniqueVP = await agent.issueVerifiablePresentation({
      keyRef: 'test',
      verifiableCredentials: [uniqueVC.verifiableCredential],
      domain: `f825-87-213-241-251.eu.ngrok.io`,
    })
    console.log(JSON.stringify(uniqueVP, null, 2))

    const resultvp = await agent.checkVerifiablePresentation({ verifiablePresentation: uniqueVP.verifiablePresentation })
    console.log(resultvp)*/
  })
})
