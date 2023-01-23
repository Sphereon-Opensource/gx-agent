import { program } from 'commander'
import { GxEntityType } from './types'
import { printTable } from 'console-table-printer'
import { getAgent } from '@sphereon/gx-agent'

const ecosystem = program.command('ecosystem').description('gx-participant ecosystem')

ecosystem
  .command('add')
  .description('Adds a new Gaia-x ecosystem to the client')
  .requiredOption('-n, --name <string>', 'ecosystem name')
  .requiredOption('-url, --ecosystem-url <string>', 'gaia-x ecosystem server address')
  .action(async (cmd) => {
    const agent = await getAgent()
    const id = await agent.dataStoreSaveMessage({
      //todo: create an entity here instead of using message
      message: {
        id: cmd.name,
        type: GxEntityType.ecosystem,
        createdAt: new Date().toUTCString(),
        data: {
          name: cmd.name,
          'ecosystem-url': cmd.ecosystemUrl,
        },
      },
    })
    printTable([{ id }])
  })

ecosystem
  .command('submit')
  .description('Onboards the participant to the new ecosystem')
  .option('-sdid, --sd-id <string>', 'id of your self-description')
  .option('-cid, --compliance-id <string>', '')
  .option('-eurl, --ecosystem-url <string>', 'URL of gx-compliance server')
  .option('-e, --ecosystem <string>', 'alias of your ecosystem')
  .action(async (cmd) => {
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
