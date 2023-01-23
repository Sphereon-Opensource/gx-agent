import 'cross-fetch/polyfill'
import { program } from 'commander'
import { getAgent } from '@sphereon/gx-agent'
import { createAgentConfig, getDefaultAgentFile } from '@sphereon/gx-agent/dist/utils/config-utils'

const config = program.command('config').description('Agent configuration')

config
  .command('create', { isDefault: true })
  .description('Create default agent config')
  .option(
    '--location <string>',
    'Config file name and location (defaults to `home`: <USER-HOME>/.gx-agent/agent.yml. Valid values are `home` and `cwd`. cwd means the current working directory)',
    './agent.yml'
  )
  // .option('--template <string>', 'Use template (default,client)', 'default')

  .action(async (options) => {
    const { location } = options

    const path = location && location.toLowerCase() === 'cwd' ? './agent.yml' : getDefaultAgentFile()

    createAgentConfig(path)
  })

config
  .command('check')
  .alias('verify')
  .description('Verify a Gaia-X agent config file syntax')
  .option('-f, --filename <string>', 'Config file name', '<USERHOME>/.gx-agent/agent.yml')
  .option('-m, --method <string>', 'Check that a specific method is exposed by the agent.', 'execute')
  .action(async (options) => {
    const agent = getAgent({ path: options.filename })
    if (!agent) {
      console.error(
        'unknown error while creating the agent from your config. Consider running `veramo config create` to generate a new configuration file, or to manually compare differences.'
      )
    } else {
      // @ts-ignore
      if (typeof agent[options.method] !== 'function') {
        console.error(
          `The agent was created using the config, but the 'agent.${options.method}()' method is not available. Make sure the plugin that implements that method is installed.`
        )
      } else {
        console.log(
          `Your Gaia-X agent configuration seems fine. An agent can be created and the 'agent.${options.method}()' method can be called on it.`
        )
      }
    }
  })
