import 'cross-fetch/polyfill'
import yaml from 'yaml'
import { ICredentialPlugin, IDataStore, IDataStoreORM, IDIDManager, IKeyManager, IMessageHandler, IResolver, TAgent } from '@veramo/core'
import { ISelectiveDisclosure } from '@veramo/selective-disclosure'
import { IDIDComm } from '@veramo/did-comm'
import { IDIDDiscovery } from '@veramo/did-discovery'
import { createAgentFromConfig } from '@veramo/cli/build/lib/agentCreator'
import { IGaiaxComplianceClient } from '@sphereon/gx-compliance-client'

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

// TODO: This should be moved to a types file in the gx-compiance-client for re-use
export type EnabledInterfaces = IDIDManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IResolver &
  IMessageHandler &
  IDIDComm &
  ICredentialPlugin &
  ISelectiveDisclosure &
  IDIDDiscovery &
  IGaiaxComplianceClient

export type ConfiguredAgent = TAgent<EnabledInterfaces>

export function getAgent(fileName: string): ConfiguredAgent {
  try {
    return createAgentFromConfig<EnabledInterfaces>(getConfig(fileName))
  } catch (e: any) {
    console.log('Unable to create agent from ' + fileName + '.', e.message)
    process.exit(1)
  }
}
