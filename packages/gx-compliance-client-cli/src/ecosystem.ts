import { program } from 'commander'

const ecosystem = program.command('ecosystem').description('gx client ecosystem')

ecosystem
  .command('add')
  .description('creates a new gaia-x compliance client')
  .option('-name, --name <string>', 'ecosystem name')
  .option('-ecosystem-url, --ecosystem-url <string>', 'gaia-x compliance server address')
  .action(async (cmd) => {})
