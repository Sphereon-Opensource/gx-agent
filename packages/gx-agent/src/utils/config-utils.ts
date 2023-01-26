import { homedir } from 'os'
import fs from 'fs'
import { dirname } from 'path'
import yaml from 'yaml'

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

export function createAgentConfig(path: string) {
  const dir = createAgentDir(path)
  const agentPath = `${dir}/agent.yml`

  if (!fs.existsSync(agentPath)) {
    console.log('Creating agent file: ' + agentPath)
    const templateFile = __dirname + '/../fixtures/template-agent.yml'
    const contents = fs.readFileSync(templateFile)
    fs.writeFileSync(agentPath, contents)
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

export const getConfig = (fileName: string): any => {
  if (!fs.existsSync(fileName)) {
    console.log('Config file not found: ' + fileName)
    // fixme: We should provide an example file and provide rename/copy instructions here, as veramo _config create will never create a valid GX _config
    console.log('Use "gx-agent config create" to create one')
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

export const showConfig = (fileName: string): string => {
  return yaml.stringify(getConfig(fileName))

}
