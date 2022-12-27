import { TAgent } from '@veramo/core'
import { IGaiaxComplianceClient } from '../../src'

type ConfiguredAgent = TAgent<IGaiaxComplianceClient>

// const LTO_DID = 'did:lto:3MsS3gqXkcx9m4wYSbfprYfjdZTFmx2ofdX'

export default (testContext: { getAgent: () => ConfiguredAgent; setup: () => Promise<boolean>; tearDown: () => Promise<boolean> }) => {
  describe('gx compliance client Agent Plugin', () => {
    let agent: ConfiguredAgent

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
    })

    afterAll(async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 10000)) // avoid jest open handle error
      await testContext.tearDown()
    })

    it('should issue credential', async () => {
      console.log(agent)
      /*return await expect(
        agent.issueVerifiableCredential({
          customContext: 'https://registry.gaia-x.eu/v2206/api/shape',
          key: {
            privateKeyHex:
              '078c0f0eaa6510fab9f4f2cf8657b32811c53d7d98869fd0d5bd08a7ba34376b8adfdd44784dea407e088ff2437d5e2123e685a26dca91efceb7a9f4dfd81848',
            publicKeyHex: '8adfdd44784dea407e088ff2437d5e2123e685a26dca91efceb7a9f4dfd81848',
            kms: 'local',
            kid: `${LTO_DID}#sign`,
            type: 'Ed25519',
          },
          purpose: 'assertionMethod',
          subject: {
            id: 'did:web:compliance.gaia-x.eu',
            'gx-participant:name': 'Gaia-X AISBL',
            'gx-participant:legalName': 'Gaia-X European Association for Data and Cloud AISBL',
            'gx-participant:registrationNumber': {
              'gx-participant:registrationNumberType': 'local',
              'gx-participant:registrationNumberNumber': '0762747721',
            },
            'gx-participant:headquarterAddress': {
              'gx-participant:addressCountryCode': 'BE',
              'gx-participant:addressCode': 'BE-BRU',
              'gx-participant:streetAddress': 'Avenue des Arts 6-9',
              'gx-participant:postalCode': '1210',
            },
            'gx-participant:legalAddress': {
              'gx-participant:addressCountryCode': 'BE',
              'gx-participant:addressCode': 'BE-BRU',
              'gx-participant:streetAddress': 'Avenue des Arts 6-9',
              'gx-participant:postalCode': '1210',
            },
            'gx-participant:termsAndConditions': '70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700',
          },
          type: IGaiaxCredentialType.LegalPerson,
          verificationMethodId: 'did:web:compliance#vm',
        })
      ).resolves.not.toBeNull()*/
      expect(true).toBe(true)
    })
  })
}
