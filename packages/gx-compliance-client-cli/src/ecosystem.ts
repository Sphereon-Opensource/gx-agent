import { program } from 'commander'
import { getAgent } from './setup'
import { GxEntityType } from './types'
import { printTable } from 'console-table-printer'

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
