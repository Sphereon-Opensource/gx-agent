import { program } from 'commander'
import { getAgent } from './setup'
import { GxEntityType } from './types'
import { printTable } from 'console-table-printer'
import fs from "fs";

const ecosystem = program.command('ecosystem').description('gx-participant ecosystem')

ecosystem
  .command('add')
  //todo: description???
  .description('creates a new gaia-x compliance client')
  .requiredOption('-n, --name <string>', 'ecosystem name')
  .requiredOption('-url, --ecosystem-url <string>', 'gaia-x ecosystem server address')
  .action(async (cmd) => {
    const agent = getAgent(program.opts().config)
    const id = await agent.dataStoreSaveMessage({
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
    const sd = JSON.parse(fs.readFileSync(cmd['sd-file'], 'utf-8'))
    console.log(sd)
    // const agent = getAgent(program.opts().config)
    // const selfDescription = await agent.acquireComplianceCredentialFromUnsignedParticipant()
    // printTable([{...selfDescription}])
  } catch(e:unknown) {
    console.error(e)
  }
})
