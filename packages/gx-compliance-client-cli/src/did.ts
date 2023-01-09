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

  try {
    const providers = await agent.didManagerGetProviders()
    const kms = await agent.keyManagerGetKeyManagementSystems()

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        choices: providers,
        message: 'Select identifier provider',
      },
      {
        type: 'list',
        name: 'kms',
        choices: kms,
        message: 'Select key management system',
      },
      {
        type: 'input',
        name: 'alias',
        message: 'Enter alias',
      },
    ])

    const identifier = await agent.didManagerCreate(answers)
    printTable([{ provider: identifier.provider, alias: identifier.alias, did: identifier.did }])
  } catch (e: any) {
    console.error(e.message)
  }
})
