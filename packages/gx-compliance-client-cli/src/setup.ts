import 'cross-fetch/polyfill'
import yaml from 'yaml'
import { TAgent } from '@veramo/core'
import { createAgentFromConfig } from '@veramo/cli/build/lib/agentCreator'
import { GXPluginMethodMap } from '@sphereon/gx-compliance-client'

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
  return config
}

export type ConfiguredAgent = TAgent<GXPluginMethodMap>

export function getAgent(fileName: string): ConfiguredAgent {
  try {
    return createAgentFromConfig<GXPluginMethodMap>(getConfig(fileName))
  } catch (e: any) {
    console.log('Unable to create agent from ' + fileName + '.', e.message)
    process.exit(1)
  }
}
