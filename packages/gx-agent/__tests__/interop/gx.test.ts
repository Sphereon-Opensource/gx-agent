import { createAgent, IDIDManager, IKeyManager, IResolver, TAgent, W3CVerifiableCredential } from '@veramo/core'
import { CredentialPlugin } from '@veramo/credential-w3c'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { WebDIDProvider } from '@veramo/did-provider-web'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { Resolver } from 'did-resolver'

// @ts-ignore
import nock from 'nock'
import { getResolver } from 'web-did-resolver'
import { CredentialHandlerLDLocal, ICredentialHandlerLDLocal, LdDefaultContexts, MethodNames } from '@sphereon/ssi-sdk.vc-handler-ld-local'
import { GXJsonWebSignature2020 } from '../../src'

import { GX_COMPLIANCE_VC } from '../fixtures/gx'

// jest.setTimeout(100000)

describe('Gaia-X issued VC', () => {
  let agent: TAgent<IResolver & IKeyManager & IDIDManager & ICredentialHandlerLDLocal>

  const webResolver = getResolver()

  // jest.setTimeout(1000000)
  beforeAll(async () => {
    agent = createAgent({
      plugins: [
        new KeyManager({
          store: new MemoryKeyStore(),
          kms: {
            local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
          },
        }),
        new DIDManager({
          providers: {
            'did:web': new WebDIDProvider({ defaultKms: 'local' }),
          },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:web',
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...webResolver,
          }),
        }),
        new CredentialPlugin(),
        new CredentialHandlerLDLocal({
          contextMaps: [LdDefaultContexts],
          suites: [new GXJsonWebSignature2020()],
          bindingOverrides: new Map([
            // Bindings to test overrides of credential-ld plugin methods
            ['createVerifiableCredentialLD', MethodNames.createVerifiableCredentialLDLocal],
            ['createVerifiablePresentationLD', MethodNames.createVerifiablePresentationLDLocal],
            // We test the verify methods by using the LDLocal versions directly in the tests
          ]),
        }),
      ],
    })
  })

  it('should be verified with PS256 sig', async () => {
    const verifiableCredential: W3CVerifiableCredential = GX_COMPLIANCE_VC
    expect(verifiableCredential).toBeDefined()
    // console.log(verifiableCredential)

    const verifiedCredential = await agent.verifyCredentialLDLocal({
      credential: verifiableCredential,
      fetchRemoteContexts: true,
    })

    expect(verifiedCredential).toMatchObject({
      "verified": true,
      "log": [
        {
          "id": "expiration",
          "valid": true
        },
        {
          "id": "valid_signature",
          "valid": true
        },
        {
          "id": "issuer_did_resolves",
          "valid": true
        },
        {
          "id": "revocation_status",
          "valid": true
        }
      ],
    })
  })
})
