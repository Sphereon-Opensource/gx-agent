import fetch from 'cross-fetch'
import { IGaiaxComplianceConfig } from '../types/index.js'

export async function postRequest(url: string, body: BodyInit): Promise<unknown> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body,
    })
    if (!response || !response.status || response.status < 200 || response.status >= 400) {
      throw new Error(`Can't get the response from ${url}: ${await response.text()}`)
    }
    return await response.json()
  } catch (error) {
    throw new Error(`${(error as Error).message}`)
  }
}

export function getApiVersionedUrl(config: IGaiaxComplianceConfig, baseUrl?: string) {
  if (!config && !baseUrl) {
    config = {
      complianceServiceUrl: 'http://localhost:3003',
      complianceServiceVersion: '2206',
    }
  }
  if (config.complianceServiceVersion === 'v2210') {
    config.complianceServiceVersion = '2210vp'
  }
  return baseUrl
    ? `${baseUrl}/api${config.complianceServiceVersion ? `/${config.complianceServiceVersion}` : ''}`
    : `${config.complianceServiceUrl}/api${config.complianceServiceVersion ? `/${config.complianceServiceVersion}` : ''}`
}
