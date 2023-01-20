import fetch from 'cross-fetch'
import { IGaiaxComplianceConfig } from '../types'

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

export function getApiVersionedUrl(config: IGaiaxComplianceConfig) {
  if (!config) {
    config = {
      complianceServiceUrl: 'http://localhost:3002',
      complianceServiceVersion: '2206',
    }
  }
  return `${config.complianceServiceUrl}${config.complianceServiceVersion ? `/${config.complianceServiceVersion}` : ''}/api`
}
