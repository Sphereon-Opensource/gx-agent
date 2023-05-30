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

export function getApiVersionedUrl(config: IGaiaxComplianceConfig, baseUrl?: string): string {
  const apiVersionText =
    !config || !config.complianceServiceVersion || config.complianceServiceVersion === 'v1.2.8'
      ? ''
      : config.complianceServiceUrl === 'v2210'
      ? '2210vp'
      : '2206'
  const url = baseUrl ? baseUrl : config && config.complianceServiceUrl ? config.complianceServiceUrl : 'http://localhost:3000'

  return apiVersionText.length > 0 ? `${url}/api${apiVersionText}` : `${url}/api`
}
