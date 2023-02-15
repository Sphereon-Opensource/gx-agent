import { program } from 'commander'
import inquirer from 'inquirer'

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import inquirerAutoPrompt from 'inquirer-autocomplete-prompt'
import './config.js'
import './did.js'
import './vc.js'
import './vp.js'
import './ecosystem.js'
import './participant.js'
import './service-offering.js'
import { asDID, getAgent } from '@sphereon/gx-agent'
import { exportParticipant } from './participant.js'
import { printTable } from 'console-table-printer'
import { exportServiceOffering } from './service-offering.js'

inquirer.registerPrompt('autocomplete', inquirerAutoPrompt)

program
  .command('export')
  .description('Exports all agent data so it can be hosted or backed-up')
  .option('-d, --did <string>', 'the DID or domain which will be used')
  .option('-p, --path <string>', 'A base path to export the files to. Defaults to "exported"')
  .action(async (cmd) => {
    const did = await asDID(cmd.did)
    cmd.did = did
    const agent = await getAgent()

    const exportResults = await agent.exportDIDToPath({ domain: did, path: cmd.path })
    const participantResults = await exportParticipant(cmd)
    const serviceResults = await exportServiceOffering(cmd)

    printTable(exportResults.concat(participantResults).concat(serviceResults))
    console.log(`DID, Participant and Service Offering self-description files have been written to the above paths`)
  })

if (!process.argv.slice(2).length) {
  program.outputHelp()
} else {
  program.parse(process.argv)
}
