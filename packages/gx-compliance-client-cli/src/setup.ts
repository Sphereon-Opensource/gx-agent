import 'cross-fetch/polyfill'
import yaml from 'yaml'
import { TAgent } from '@veramo/core'
import { GXPluginMethodMap } from '@sphereon/gx-compliance-client'
import { setupGXAgent } from '@sphereon/gx-compliance-client'

const fs = require('fs')

export const getConfig = (fileName: string): any => {
  if (!fs.existsSync(fileName)) {
    console.log('Config file not found: ' + fileName)
    // fixme: We should provide an example file and provide rename/copy instructions here, as veramo config create will never create a valid GX config
    console.log('Use "veramo config create" to create one')
    process.exit(1)
  }

  const config = yaml.parse(fs.readFileSync(fileName).toString(), { prettyErrors: true })

  if (config?.version != 3) {
    console.log('Unsupported configuration file version:', config.version)
    process.exit(1)
  }
  if (!config.gx) {
    console.log(`No Gaia-X config options found in gx section from ${fileName}`)
    process.exit(1)
  }
  return config
}

export type ConfiguredAgent = TAgent<GXPluginMethodMap>

export async function getAgent(fileName: string): Promise<ConfiguredAgent> {
  try {
    const config = getConfig(fileName ? fileName : 'agent.yml')
    if (!config.gx.dbEncryptionKey) {
      // todo: help user how to change the encryption key
      console.log(`Warning: default database encryption key is used`)
    }
    const dbEncryptionKey = config.gx.dbEncryptionKey ? config.gx.dbEncryptionKey : 'CHANGEME'
    const dbFile = config.gx.dbFile ? config.gx.dbFile : './db/gx.db.sqlite'
    return await (
      await setupGXAgent({ dbEncryptionKey, dbFile, config: config.gx })
    ).agent
    // return createAgentFromConfig<GXPluginMethodMap>(getConfig(fileName ? fileName : 'agent.yml'))
  } catch (e: any) {
    console.log('Unable to create agent from ' + fileName + '.', e.message)
    process.exit(1)
  }
}
