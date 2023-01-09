import { program } from 'commander'

const participant = program.command('participant').description('gx participant')

participant
  .command('compliance')
  .command('submit')
  .description('submits a self-description file to gx-compliance server')
  .option('-sd-file, --sd-file <string>', 'address of your sd-file')
  .option('-sd-id, --sd-id <string>', 'id of your sd')
  .action(async (cmd) => {})

participant
  .command('self-description')
  .command('create')
  .description('creates a self-description file based on your self-description file')
  .option('-sd-file, --sd-file <string>', 'address of your sd-file')
  .action(async (cmd) => {})

participant
  .command('self-description')
  .command('verify')
  .description('verifies a self-description file (by a external call to gx-compliance server)')
  .option('-sd-file, --sd-file <string>', 'address of your sd-file')
  .action(async (cmd) => {})

participant
  .command('compliance')
  .command('status')
  .description('shows the compliance status of the Participant')
  .option('-sd-id, --sd-id <string>', 'id of your sd')
  .action(async (cmd) => {})

participant
  .command('ecosystem')
  .command('submit')
  .description('Onboards the participant to the new ecosystem')
  .option('-sd-id, --sd-id <string>', 'id of your sd')
  .option('-compliance-id, --compliance-id <string>', '')
  .option('-ecosystem-url, --ecosystem-url <string>', 'URL of gx-compliance server')
  .option('-e, --ecosystem <string>', 'alias of your ecosystem')
  .action(async (cmd) => {})
