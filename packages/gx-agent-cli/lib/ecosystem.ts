import { program } from 'commander'
import { printTable } from 'console-table-printer'
import { EcosystemConfig, getAgent } from '@sphereon/gx-agent'
import {
  addEcosystemConfigObject,
  assertValidEcosystemConfigObject,
  deleteEcosystemConfigObject,
  getAgentConfigPath,
  getEcosystemConfigObject,
  getEcosystemConfigObjects,
} from '@sphereon/gx-agent/dist/utils/config-utils'

const ecosystem = program.command('ecosystem').description('Ecosystem specific commands')

ecosystem
  .command('add')
  .alias('update')
  .description('Adds or updates a Gaia-x ecosystem to the client')
  .argument(
    '<name>',
    'ecosystem name. Please ensure to use use quotes in case the name contains spaces. We suggest to use a shorthand/abbreviation for the name, and to use the description for the fullname'
  )
  .argument('<url>', 'gaia-x ecosystem server address')
  .option('-d, --description <string>', 'Description')
  .action(async (name, url, cmd) => {
    //just to verify the agent loads
    await getAgent()

    const configPath = getAgentConfigPath()
    const existingConfig = getEcosystemConfigObject(configPath, name)
    const ecosystemConfig: EcosystemConfig = {
      name,
      url,
      description: cmd.description,
    }
    assertValidEcosystemConfigObject(ecosystemConfig)
    addEcosystemConfigObject(configPath, ecosystemConfig)
    //just to verify the agent loads
    await getAgent()

    if (existingConfig) {
      console.log(`Existing ecosystem ${name} has been updated in your agent configuration: ${getAgentConfigPath()}`)
      printTable([
        {
          version: 'previous',
          name: existingConfig.name,
          url: existingConfig.url,
          description: existingConfig.description,
        },
        { version: 'new', name, url, description: cmd.description },
      ])
    } else {
      console.log(`New ecosystem ${name} has been added to your agent configuration: ${getAgentConfigPath()}`)
      printTable([{ name, url, description: cmd.description }])
    }
  })

ecosystem
  .command('list')
  .description('Lists all Gaia-x ecosystems known to the agent (that are in the configuration)')
  .action(async (cmd) => {
    const configPath = getAgentConfigPath()
    const ecosystems = getEcosystemConfigObjects(configPath)

    if (!ecosystems || ecosystems.length === 0) {
      console.log('No ecosystems currently configured. You can create one using the "gx-agent ecosystem add" command')
    } else {
      printTable(ecosystems)
    }
  })

ecosystem
  .command('delete')
  .description('Deletes a Gaia-x ecosystem from the agent configuration')
  .argument('<name>', 'ecosystem name')
  .action(async (name) => {
    //just to verify the agent loads
    await getAgent()

    const configPath = getAgentConfigPath()
    const existing = getEcosystemConfigObject(configPath, name)
    if (!existing) {
      console.log(`No ecosystem with name "${name}" was found in the agent config: ${configPath}`)
    } else {
      deleteEcosystemConfigObject(configPath, name)

      //just to verify the agent loads
      await getAgent()

      printTable([{ ...existing }])
      console.log(`Ecosystem ${name} has been deleted from your agent configuration: ${getAgentConfigPath()}`)
    }
  })

ecosystem
  .command('submit')
  .description('Onboards the participant to the new ecosystem')
  .argument('<name>', 'The ecosystem name (has to be available in your configuration)')
  .requiredOption('-sid, --sd-id <string>', 'id of your self-description')
  .requiredOption('-cid, --compliance-id <string>', '')
  .action(async (name, cmd) => {
    try {
      const agent = await getAgent()
      const selfDescriptionId = cmd.sdId
      const complianceId = cmd.complianceId

      //fixme: Does not take ecosystem into account at all
      const selfDescription = await agent.onboardParticipantWithCredentialIds({
        selfDescriptionId,
        complianceId,
      })
      printTable([{ ...selfDescription }])
    } catch (e: unknown) {
      console.error(e)
    }
  })
