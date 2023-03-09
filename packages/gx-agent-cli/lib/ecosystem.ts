import { program } from 'commander'
import { printTable } from 'console-table-printer'
import {getAgent, EcosystemConfig, asDID} from '@sphereon/gx-agent'
import { CredentialPayload, VerifiableCredential } from '@veramo/core'
import {
  addEcosystemConfigObject,
  assertValidEcosystemConfigObject,
  deleteEcosystemConfigObject,
  getAgentConfigPath,
  getEcosystemConfigObject,
  getEcosystemConfigObjects,
} from '@sphereon/gx-agent'
import fs from 'fs'

const ecosystem = program.command('ecosystem').description('Ecosystem specific commands')
const so = ecosystem.command('so').alias('service-offering').description('Service offering self-description commands')
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
      console.error(`No ecosystem with name "${name}" was found in the agent config: ${configPath}`)
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
  .requiredOption('-sid, --sd-id <string>', 'ID of your self-description verifiable credential')
  .requiredOption('-cid, --compliance-id <string>', 'ID of your compliance credential')
  .option('-p, --persist', 'Persist the credential. If not provided the credential will not be stored in the agent')
  .option('--show', 'Show self descriptions')
  .action(async (name, cmd) => {
    const agent = await getAgent()
    try {
      const selfDescriptionVC = await agent.dataStoreGetVerifiableCredential({ hash: cmd.sdId })
      const complianceVC = await agent.dataStoreGetVerifiableCredential({ hash: cmd.complianceId })

      const agentPath = getAgentConfigPath()
      const ecosystemConfig: EcosystemConfig | undefined = getEcosystemConfigObject(agentPath, name)
      if (!ecosystemConfig) {
        console.error(`Couldn't find the ecosystem: ${name}`)
        return
      }
      const selfDescription = await agent.onboardParticipantOnEcosystem({
        ecosystemUrl: ecosystemConfig.url,
        selfDescriptionVC,
        complianceVC,
        persist: cmd.persist,
        show: cmd.show,
      })
      if (cmd.show) {
        console.log(JSON.stringify(selfDescription, null, 2))
      }
      printTable([{ ...selfDescription }])
    } catch (e: any) {
      console.error(e.message)
    }
  })

so.command('submit')
  .description('Submits as service offering in the ecosystem')
  .argument('<name>', 'The ecosystem name (has to be available in your configuration)')
  .requiredOption('-sid, --sd-id <string>', 'ID of your self-description verifiable credential')
  .requiredOption('-cid, --compliance-id <string>', 'ID of your compliance credential from Gaia-X compliance')
  .requiredOption('-eid, --ecosystem-compliance-id <string>', 'ID of your compliance credential from ecosystem')
  .option('-sof, --so-input-file <string>', 'Unsigned service-offering input file location')
  .option('-soid, --so-id <string>', 'ID of your self-description service-offering verifiable credential')
  .option('-lai, --label-ids <string...>', 'ID(s) of any label Verifiable Credential you want to include with the service offering')
  .option('-laf, --label-files <string...>', 'Path(s) any label Verifiable Credential you want to include with the service offering')
  .option('-p, --persist', 'Persists VPs created in the intermediate steps')
  .option('--show', 'Show self descriptions')
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
    if (!cmd.soInputFile && !cmd.soId) {
      throw Error('You have to provide either unsigned service-offering credential or an id for a service-offering vc. Please check parameters')
    }
    let soVC
    if (cmd.soId) {
      soVC = await agent.dataStoreGetVerifiableCredential({ hash: cmd.soId })
    } else {
      const credential: CredentialPayload = JSON.parse(fs.readFileSync(cmd.soInputFile, 'utf-8')) as CredentialPayload
      const did = typeof credential.issuer === 'string' ? credential.issuer : credential.issuer ? credential.issuer.id : await asDID()
      const uniqueSoVC = await agent.issueVerifiableCredential({
        credential,
        keyRef: cmd.keyIdentifier,
        domain: did,
        persist: true,
      })
      soVC = uniqueSoVC.verifiableCredential
      printTable([
        {
          types: soVC.type!.toString().replace('VerifiableCredential,', ''),
          issuer: soVC.issuer,
          subject: soVC.credentialSubject.id,
          'issuance-date': soVC.issuanceDate,
          id: uniqueSoVC.hash,
          persisted: true,
        },
      ])
    }
    let labelVCs: VerifiableCredential[] = []
    if (cmd.labelFiles) {
      for (const path of cmd.labelFiles) {
        labelVCs.push(JSON.parse(fs.readFileSync(path, 'utf-8')) as VerifiableCredential)
      }
    }
    if (cmd.labelIds) {
      for (const id of cmd.labelIds) {
        labelVCs.push(await agent.dataStoreGetVerifiableCredential({ hash: id }))
      }
    }
    try {
      const agentPath = getAgentConfigPath()
      const ecosystemConfig: EcosystemConfig | undefined = getEcosystemConfigObject(agentPath, name)
      if (!ecosystemConfig) {
        console.error(`Couldn't find the ecosystem: ${name}`)
        return
      }
      const onboardingResult = await agent.onboardServiceOfferingOnEcosystem({
        ecosystemUrl: ecosystemConfig.url,
        sdId: cmd.sdId,
        complianceId: cmd.complianceId,
        ecosystemComplianceId: cmd.ecosystemComplianceId,
        serviceOffering: soVC,
        labelVCs,
        persist: cmd.persist,
        show: cmd.show,
      })
      printTable([{ ...onboardingResult }])
    } catch (e: any) {
      console.error(e.message)
    }
  })
