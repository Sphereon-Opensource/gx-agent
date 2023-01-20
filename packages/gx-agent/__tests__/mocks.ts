import { JWK } from '../src'

export const participantDid = createMockedDID('did:web:participant', {
  kty: 'RSA',
  n: 'rX_O2vjIhZ5d1686aC421P-Uhn4MtDQzT-xcdMOpqYbfTctHT4pYIylm3m658PtAJjNqqJFRLP_6sP0_MAIusxJbWyyV_5kfBtimaI6SIkHKDyifUCIdXeu6cQ7HYwkLl5tlvdO0yA2o0Ezjj--GBkUj1MB0asz5NCXn5pXg1u-jl-5BynYUeOXoShc9bdy6YlFjtSh36yTzYIJHVnI7ZJRNL9GDOtmCUdJWOpO26DPFtd2bAJ1TVb0Tflg9NEHj1V3nx4A9-Gp9AyV4tBR43uRS0JUza-JJZzKP9PWiH5i2baegjgxxyti34cxIVri4F-i-HOcgY4YJt-v-Cfbr4w',
  e: 'AQAB',
  alg: 'PS256',
  x5u: 'http://participant/.well-known/x509CertificateChain.pem',
})

export const mockedDID = createMockedDID(
  'did:web:f825-87-213-241-251.eu.ngrok.io',
  {
    kty: 'RSA',
    n: '1esfhwiRSpFYG3lFsvYgljhZtSebzZ2zgwzGrBz46fJuz49swanZFLCZ-tnExDYACNG-lQf4k7asMqXWFEMU2oxIZ1Jv_RXkH_L4_At-DiPPND3oYHr4gkKwpVqy84w3HBL6EFUirc_ANWM3N0qrsPLkHxSlajwgysup1Y4U3gx4_bcQSU36Jh_lmB6Q97LpkV7txgecWUBsAuh9t3K2iaVdUcNw_8-5xZapYPQEGcEp47yPixOJ2SmXpoR2iTpvZK4ZNyF3JxqKQg2pGJqVbVovthSwdxQkOqF21obQd6IiJcvDmnHSxLo6DiHBGYEYxJO83PSkTY3Xyh7yZMAkUw',
    e: 'AQAB',
    x5u: 'https://f825-87-213-241-251.eu.ngrok.io/.well-known/fullchain.pem',
  },
  'did:web:f825-87-213-241-251.eu.ngrok.io#test'
)
export function createMockedDID(did: string, publicKeyJwk: JWK, vm?: string) {
  const vmId = vm ? vm : `${did}:JWK2020-RSA`
  return {
    '@context': ['http://www.w3.org/ns/did/v1'],
    id: did,
    verificationMethod: [
      {
        '@context': 'https://w3c-ccg.github.io/lds-jws2020/contexts/v1/',
        id: vmId,
        type: 'JsonWebKey2020',
        controller: did,
        publicKeyJwk,
      },
    ],
    assertionMethod: [vmId],
    authentication: [vmId],
  }
}
