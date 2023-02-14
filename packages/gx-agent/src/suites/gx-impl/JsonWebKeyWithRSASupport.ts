import { JWS } from '@transmute/jose-ld'

import { JsonWebKey2020, WebCryptoKey } from '@transmute/web-crypto-key-pair'

export { JsonWebKey2020 }
/**
 * WARNING:
 *
 * This suite is made specifically to be interoperable with Gaia-X. Do not use this suite for other purposes, as the current Gaia-X implementation contains multiple errors and does not conform to JsonWebSignature2020.
 * If you do need regular JsonWebSignature2020 support, please configure the SphereonWebSignature2020 class when setting up the agent
 */
const getKeyPairForKtyAndCrv = (kty: string, crv: string) => {
  if (kty === 'RSA') {
    return WebCryptoKey
  }
  throw new Error(`getKeyPairForKtyAndCrv does not support: ${kty} and ${crv}`)
}

const getKeyPairForType = (k: any) => {
  if (k.type === 'JsonWebKey2020') {
    return getKeyPairForKtyAndCrv(k.publicKeyJwk.kty, k.publicKeyJwk.crv)
  }
  if (k.type === 'RSAVerificationKey2018' /* || k.publicKeyJwk.kty === 'RSA'*/) {
    return WebCryptoKey
  }

  throw new Error('getKeyPairForType does not support type: ' + k.type)
}

const getVerifier = async (k: any, options = { detached: true }) => {
  const { publicKeyJwk } = await k.export({ type: 'JsonWebKey2020' })
  const { kty } = publicKeyJwk

  if (kty === 'RSA') {
    // @ts-ignore
    return JWS.createVerifier(k.verifier('RSA'), 'RS256', options)
  }

  throw new Error(`getVerifier does not support ${JSON.stringify(publicKeyJwk, null, 2)}`)
}

const getSigner = async (k: any, options = { detached: true }) => {
  const { publicKeyJwk } = await k.export({ type: 'JsonWebKey2020' })
  const { kty } = publicKeyJwk

  if (kty === 'RSA') {
    // @ts-ignore
    return JWS.createSigner(k.signer('RSA'), 'RS256', options)
  }

  throw new Error(`getSigner does not support ${JSON.stringify(publicKeyJwk, null, 2)}`)
}

const applyJwa = async (k: any, options?: any) => {
  const verifier = options?.verifier !== undefined ? options.verifier : await getVerifier(k, options)
  k.verifier = () => verifier as any
  if (k.privateKey || options?.signer !== undefined) {
    const signer = options?.signer !== undefined ? options.signer : await getSigner(k, options)
    k.signer = () => signer as any
  }
  return k
}

// this is dirty...
const useJwa = async (k: any, options?: any) => {
  // before mutation, annotate the apply function....
  k.useJwa = async (options?: any) => {
    return applyJwa(k, options)
  }
  return applyJwa(k, options)
}

export class JsonWebKey {
  public id!: string
  public type!: string
  public controller!: string

  static from = async (k: JsonWebKey2020, options: any = { detached: true }) => {
    const KeyPair = getKeyPairForType(k)
    const kp = await KeyPair.from(k as any)
    let { detached, header, signer, verifier } = options
    if (detached === undefined) {
      detached = true
    }
    return useJwa(kp, { detached, header, signer, verifier })
  }

  public signer!: () => any
  public verifier!: () => any
}
