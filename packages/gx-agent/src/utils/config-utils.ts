import { homedir } from 'os'
import fs from 'fs'
import { dirname } from 'path'

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
