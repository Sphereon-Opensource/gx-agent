import { program } from 'commander'
import { getAgent } from "./setup";
import {GxEntityType} from "./types";

const ecosystem = program.command('ecosystem').description('gx client ecosystem')

ecosystem
  .command('add')
  .description('creates a new gaia-x compliance client')
  .option('-name, --name <string>', 'ecosystem name')
  .option('-ecosystem-url, --ecosystem-url <string>', 'gaia-x compliance server address')
  .action(async (cmd) => {
    const agent = getAgent(program.opts().config)
    if (!cmd.name || !cmd['ecosystem-url']) {
      console.error('Can\'t config an ecosystem without \'name\' and \'ecosystem-url\'.')
      process.exit()
    }
    const id = await agent.dataStoreSaveMessage({
      id: cmd.name,
      type: GxEntityType.ecosystem,
      createdAt: new Date().toUTCString(),
      data: {
        name: cmd.name,
        'ecosystem-url': cmd['ecosystem-url']
      }
    })
    return id
  })
