export const participantDid = {
  '@context': ['http://www.w3.org/ns/did/v1'],
  id: 'did:web:participant',
  verificationMethod: [
    {
      '@context': 'https://w3c-ccg.github.io/lds-jws2020/contexts/v1/',
      id: 'did:web:participant',
      type: 'JsonWebKey2020',
      controller: 'did:web:participant#JWK2020-RSA',
      publicKeyJwk: {
        kty: 'RSA',
        n: 'rX_O2vjIhZ5d1686aC421P-Uhn4MtDQzT-xcdMOpqYbfTctHT4pYIylm3m658PtAJjNqqJFRLP_6sP0_MAIusxJbWyyV_5kfBtimaI6SIkHKDyifUCIdXeu6cQ7HYwkLl5tlvdO0yA2o0Ezjj--GBkUj1MB0asz5NCXn5pXg1u-jl-5BynYUeOXoShc9bdy6YlFjtSh36yTzYIJHVnI7ZJRNL9GDOtmCUdJWOpO26DPFtd2bAJ1TVb0Tflg9NEHj1V3nx4A9-Gp9AyV4tBR43uRS0JUza-JJZzKP9PWiH5i2baegjgxxyti34cxIVri4F-i-HOcgY4YJt-v-Cfbr4w',
        e: 'AQAB',
        alg: 'PS256',
        x5u: 'http://participant/.well-known/x509CertificateChain.pem',
      },
    },
  ],
  assertionMethod: ['did:web:participant#JWK2020-RSA'],
}
