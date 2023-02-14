import { homedir } from 'os'
import fs from 'fs'
import { dirname } from 'path'
import yaml from 'yaml'
import { EcosystemConfig } from '../types/index.js'
import { SecretBox } from '@veramo/kms-local'

export function getUserHome(): string {
  return homedir()
}

export function getDefaultAgentDir(): string {
  return `${homedir()}/.gx-agent`
}

export function getDefaultAgentFile(): string {
  return `${getDefaultAgentDir()}/agent.yml`
}

export function createAgentDir(path: string): string {
  if (!fs.existsSync(dirname(path))) {
    fs.mkdirSync(dirname(path))
  }
  return dirname(path)
}

export async function createAgentConfig(path: string) {
  const dir = createAgentDir(path)
  const agentPath = `${dir}/agent.yml`

  if (!fs.existsSync(agentPath)) {
    const templateFile = __dirname + '/../fixtures/template-agent.yml'
    const contents = fs.readFileSync(templateFile)
    const config: any = yaml.parse(contents.toString('utf8'))
    try {
      config.constants.dbEncryptionKey = await SecretBox.createSecretKey()
      config.gx.dbEncryptionKey = config.constants.dbEncryptionKey
      config.gx.dbFile = `${dir}/db/gx.db.sqlite`
      const yamlString: string = yaml.stringify(config)
      fs.writeFileSync(agentPath, yamlString)
    } catch (error) {
      console.log(`error on creating the agent's config: ${error}`)
    }

    console.log('Done. Agent file available at: ' + agentPath)
  } else {
    console.log('File already exists: ' + agentPath)
  }
  console.log('Please check the agent configuration file for any configuration options you wish to modify')
}

export function ensureDefaultAgentDir(): string {
  return createAgentDir(getDefaultAgentDir())
}

export function getAgentConfigPath(): string {
  if (fs.existsSync('./agent.yml')) {
    return fs.realpathSync('./agent.yml')
  } else if (fs.existsSync(`${getDefaultAgentDir()}/agent.yml`)) {
    return fs.realpathSync(`${getDefaultAgentDir()}/agent.yml`)
  }
  console.log(
    `agent.yml not found in ${getDefaultAgentDir()} nor in current directory. Please create an agent.yml config using the 'gx-agent config create' command, or switch to a directory containing your agent.yml`
  )
  process.exit(1)
}

export const getConfigAsObject = (path: string): any => {
  if (!fs.existsSync(path)) {
    console.log('Config file not found: ' + path)
    // fixme: We should provide an example file and provide rename/copy instructions here, as veramo _config create will never create a valid GX _config
    console.log('Use "gx-agent config create" to create one')
    process.exit(1)
  }

  const config = yaml.parse(fs.readFileSync(path).toString(), { prettyErrors: true })

  if (config?.version != 3) {
    console.log('Unsupported configuration file version:', config.version)
    process.exit(1)
  }
  if (!config.gx) {
    console.log(`No Gaia-X config options found in gx section from ${path}`)
    process.exit(1)
  }
  return config
}

export const getConfigAsString = (path: string): string => {
  return yaml.stringify(getConfigAsObject(path))
}

export function writeConfigObject(config: any, path: string) {
  const configStr = typeof config === 'string' ? config : yaml.stringify(config)
  createAgentDir(path)
  fs.writeFileSync(path, configStr)
}

export function getGXConfigOptions(agentPath: string): any {
  return getConfigAsObject(agentPath).gx
}

export function getEcosystemConfigObjects(agentPath: string): EcosystemConfig[] {
  const ecosystems = getGXConfigOptions(agentPath).ecosystems
  if (!ecosystems || ecosystems.length === 0) {
    return []
  }
  return ecosystems as EcosystemConfig[]
}

export function getEcosystemConfigObject(agentPath: string, name: string): EcosystemConfig | undefined {
  const ecosystems = getEcosystemConfigObjects(agentPath)
  return ecosystems.find((ecosystem) => ecosystem.name.toLowerCase() === name.toLowerCase())
}

export function assertValidEcosystemConfigObject(ecosystemConfig: EcosystemConfig): void {
  if (!ecosystemConfig) {
    throw Error(`No ecosystem object provided`)
  } else if (!ecosystemConfig.name) {
    throw Error(`No name provided for the ecosystem`)
  } else if (!ecosystemConfig.url) {
    throw Error(`No URL provided for the ecosystem`)
  }
}

export function normalizeEcosystemConfigurationObject(ecosystemConfig: EcosystemConfig) {
  assertValidEcosystemConfigObject(ecosystemConfig)
  if (!ecosystemConfig.url.startsWith('http')) {
    ecosystemConfig.url = `https://${ecosystemConfig.url}`
  }
  return ecosystemConfig
}

export function addEcosystemConfigObject(agentPath: string, newEcosystem: EcosystemConfig): void {
  assertValidEcosystemConfigObject(newEcosystem)
  const config = getConfigAsObject(agentPath)
  const ecosystems = getEcosystemConfigObjects(agentPath)
  const others = ecosystems.filter((ecosystem) => ecosystem.name.toLowerCase() !== newEcosystem.name.toLowerCase())
  if (newEcosystem.url.endsWith('/')) {
    newEcosystem.url = newEcosystem.url.substring(0, newEcosystem.url.length - 1)
  }
  const ecosystemConfigs = [...others, newEcosystem]
  config.gx.ecosystems = ecosystemConfigs
  writeConfigObject(config, agentPath)
}

export function deleteEcosystemConfigObject(agentPath: string, ecosystemName: string): void {
  const config = getConfigAsObject(agentPath)
  const ecosystem = getEcosystemConfigObject(agentPath, ecosystemName)
  if (ecosystem) {
    const updatedEcosystems = config.gx.ecosystems.filter((ec: { name: string }) => ec.name.toLowerCase() !== ecosystemName.toLowerCase())
    config.gx.ecosystems = [...updatedEcosystems]
    writeConfigObject(config, agentPath)
  }
}
