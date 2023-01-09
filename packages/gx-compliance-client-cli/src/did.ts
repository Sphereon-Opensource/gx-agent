import { getAgent } from './setup'
import { program } from 'commander'
import { printTable } from 'console-table-printer'

const did = program.command('did').description('Decentralized identifiers')

did
  .command('create')
  .description('creates a did:web with the received arguments')
  .option('-pkf, ----private-key-file <string>', 'Private Key file')
  .option('-cf, --cert-file <string>', 'Certificate file')
  .option('-cac, --ca-chain <string>', 'the Certificate Chain input')
  .option('-d, --domain <string>', 'the domain of the did')
  .action(async (cmd) => {
    const agent = getAgent(program.opts().config)

    const providers = await agent.didManagerGetProviders()
    const list = providers.map((provider) => ({ provider }))

    if (list.length > 0) {
      printTable(list)
    } else {
      console.log('No identifier providers')
    }
  })
