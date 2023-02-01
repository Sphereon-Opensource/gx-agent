import { program } from 'commander'
import { printTable } from 'console-table-printer'
import { EcosystemConfig, getAgent, normalizeEcosystemConfigurationObject } from '@sphereon/gx-agent'
import { CredentialPayload, VerifiableCredential } from '@veramo/core'
import {
  addEcosystemConfigObject,
  assertValidEcosystemConfigObject,
  deleteEcosystemConfigObject,
  getAgentConfigPath,
  getEcosystemConfigObject,
  getEcosystemConfigObjects,
} from '@sphereon/gx-agent/dist/utils/config-utils'
import fs from 'fs'

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

//todo: fix this like the so after merging the cli fixes pr
ecosystem
  .command('submit')
  .description('Onboards the participant to the new ecosystem')
  .argument('<name>', 'The ecosystem name (has to be available in your configuration)')
  .option('-sid, --sd-id <string>', 'ID of your self-description verifiable credential')
  .option('-sf, --sd-file <string>', 'File containing your self-description verifiable credential')
  .option('-cid, --compliance-id <string>', 'ID of your compliance credential')
  .option('-cf, --compliance-file <string>', 'File containing your compliance credential')
  .action(async (name, cmd) => {
    const agent = await getAgent()
    if (!cmd.sdId && !cmd.sdFile) {
      throw Error('Verifiable Credential ID or file for self-description need to be selected. Please check parameters')
    }
    if (!cmd.complianceId && !cmd.complianceFile) {
      throw Error('Verifiable Credential ID or file for self-description need to be selected. Please check parameters')
    }
    try {
      const selfDescriptionVC = cmd.sdFile
        ? (JSON.parse(fs.readFileSync(cmd.sdFile, 'utf-8')) as VerifiableCredential)
        : await agent.dataStoreGetVerifiableCredential({ hash: cmd.sdId })
      const complianceVC = cmd.complianceFile
        ? (JSON.parse(fs.readFileSync(cmd.complianceFile, 'utf-8')) as VerifiableCredential)
        : await agent.dataStoreGetVerifiableCredential({ hash: cmd.complianceId })

      const agentPath = getAgentConfigPath()
      const ecosystemConfig: EcosystemConfig | undefined = getEcosystemConfigObject(agentPath, name)
      if (!ecosystemConfig) {
        console.error(`Couldn't find the ecosystem: ${name}`)
        return
      }
      const selfDescription = await agent.onboardParticipantOnEcosystem({
        ecosystemUrl: normalizeEcosystemConfigurationObject(ecosystemConfig).url,
        selfDescriptionVC,
        complianceVC,
      })
      console.log(JSON.stringify(selfDescription, null, 2))
      printTable([{ ...selfDescription }])
    } catch (e: any) {
      console.error(e.message)
    }
  })

ecosystem
  .command('submit-service-offering')
  .alias('service-offering')
  .alias('so')
  .description('Onboards the participant to the new ecosystem')
  .argument('<name>', 'The ecosystem name (has to be available in your configuration)')
  .requiredOption('-sid, --sd-id <string>', 'ID of your self-description verifiable credential')
  .requiredOption('-cid, --compliance-id <string>', 'ID of your compliance credential from Gaia-X compliance')
  .requiredOption('-eid, --ecosystem-compliance-id <string>', 'ID of your compliance credential from ecosystem')
  .requiredOption('-sof, --so-input-file <string>', 'Unsigned service-offering input file location')
  .option('-p, --persist', 'Persists VPs created in the intermediate steps')
  .option('-s, --show', 'Show self descriptions')
  .action(async (name, cmd) => {
    const agent = await getAgent()
    if (!cmd.sdId) {
      throw Error('Verifiable Credential ID or file for self-description need to be selected. Please check parameters')
    }
    if (!cmd.complianceId) {
      throw Error('Verifiable Credential ID for your compliance credential from Gaia-X compliance need to be selected. Please check parameters')
    }
    if (!cmd.ecosystemComplianceId) {
      throw Error('Verifiable Credential ID for your compliance credential from ecosystem need to be selected. Please check parameters')
    }
    if (!cmd.soInputFile) {
      throw Error('Unsigned service-offering input file location need to be selected. Please check parameters')
    }
    try {
      const agentPath = getAgentConfigPath()
      const ecosystemConfig: EcosystemConfig | undefined = getEcosystemConfigObject(agentPath, name)
      if (!ecosystemConfig) {
        console.error(`Couldn't find the ecosystem: ${name}`)
        return
      }
      const serviceOffering = JSON.parse(fs.readFileSync(cmd.soInputFile, 'utf-8')) as CredentialPayload
      const onboardingResult = await agent.onboardServiceOfferingOnEcosystem({
        ecosystemUrl: ecosystemConfig.url,
        sdId: cmd.sdId,
        complianceId: cmd.complianceId,
        ecosystemComplianceId: cmd.ecosystemComplianceId,
        serviceOffering,
        persist: cmd.persist === true,
        show: cmd.show === true,
      })
      printTable([{ ...onboardingResult }])
    } catch (e: any) {
      console.error(e.message)
    }
  })
