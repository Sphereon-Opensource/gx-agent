import {  program } from 'commander'
import { getAgent } from './setup'
import { GxEntityType } from './types'
import { printTable } from 'console-table-printer'

const ecosystem = program.command('ecosystem').description('gx-participant ecosystem')

ecosystem
  .command('add')
  .description('Adds a new Gaia-x ecosystem to the client')
  .requiredOption('-n, --name <string>', 'ecosystem name')
  .requiredOption('-url, --ecosystem-url <string>', 'gaia-x ecosystem server address')
  .action(async (cmd) => {
    const agent = getAgent(program.opts().config)
    const id = await agent.dataStoreSaveMessage({
      //todo: create an entity here instead of using message
      message: {
        id: cmd.name,
        type: GxEntityType.ecosystem,
        createdAt: new Date().toUTCString(),
        data: {
          name: cmd.name,
          'ecosystem-url': cmd['ecosystem-url'],
        },
      },
    })
    printTable([{ id }])
  })

ecosystem
  .command('submit')
  .description('Onboards the participant to the new ecosystem')
  .option('-sd-id, --sd-id <string>', 'id of your sd')
  .option('-compliance-id, --compliance-id <string>', '')
  .option('-ecosystem-url, --ecosystem-url <string>', 'URL of gx-compliance server')
  .option('-e, --ecosystem <string>', 'alias of your ecosystem')
  .action(async (cmd) => {
    try {
      const agent = getAgent(program.opts().config)
      const participantVChash = cmd['sd-id']
      const complianceVChash = cmd['compliance-id']

      const selfDescription = await agent.onboardParticipantWithCredentialIds({
        selfDescribedVcHash: participantVChash,
        complianceCredentialHash: complianceVChash,
      })
      printTable([{ ...selfDescription }])
    } catch (e: unknown) {
      console.error(e)
    }
  })
