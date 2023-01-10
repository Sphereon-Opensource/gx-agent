import { program } from 'commander'
import { getAgent } from './setup'
import { printTable } from 'console-table-printer'
import fs from 'fs'

const participant = program.command('participant').description('gx-participant participant')

participant
  .command('compliance')
  .command('submit')
  .description('submits a self-description file to gx-compliance server')
  // fixme: They cannot both be required. They are mutually exclusive. The id looksup an existing SD, whilst the file reads from FS for a new SD
  .requiredOption('-sd-file <string>, --sd-file <string>', 'filesystem location of your sd-file')
  .requiredOption('-sd-id <string>, --sd-id <string>', 'id of your sd')
  .action(async (cmd) => {
    try {
      const sd = JSON.parse(fs.readFileSync(cmd['sd-file'], 'utf-8'))
      const id = cmd['sd-id']
      console.log(id)
      const agent = getAgent(program.opts().config)
      const selfDescription = await agent.getComplianceCredentialFromUnsignedParticipant({
        ...sd,
      })
      printTable([{ ...selfDescription }])
    } catch (e: unknown) {
      console.error(e)
    }
  })

participant
  .command('self-description')
  .command('create')
  .description('creates a self-description based on your self-description input file')
  .option('-sd-file, --sd-file <string>', 'filesystem location of your sd-file')
  .action(async (cmd) => {
    try {
      const sd = JSON.parse(fs.readFileSync(cmd['sd-file'], 'utf-8'))
      const agent = getAgent(program.opts().config)
      const selfDescription = await agent.issueVerifiableCredential({
        ...sd,
      })
      printTable([{ ...selfDescription }])
    } catch (e: unknown) {
      console.error(e)
    }
  })

participant
  .command('self-description')
  .command('verify')
  .description('verifies a self-description file (by a external call to gx-compliance server)')
  //fixme: This doesn't make sense. This should be sd-id, as this should be a SD which is already known to the agent. Not an input file
  .option('-sd-file, --sd-file <string>', 'filesystem location of your sd-file')
  .action(async (cmd) => {
    try {
      const sd = fs.readFileSync(cmd['sd-file'], 'utf-8')
      const result = await (
        await fetch('http://v2206/api/participant/verify/raw', {
          method: 'POST',
          body: JSON.stringify(sd),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })
      ).json()
      printTable([{ ...result }])
    } catch (e: unknown) {
      console.error(e)
    }
  })

participant
  .command('compliance')
  .command('status')
  .description('shows the compliance status of the Participant')
  .option('-sd-id, --sd-id <string>', 'id of your sd')
  .action(async (cmd) => {
    console.error('Feature not implemented yet')
  })

// fixme: This should move to ecosystem.ts
participant
  .command('ecosystem')
  .command('submit')
  .description('Onboards the participant to the new ecosystem')
  .option('-sd-id, --sd-id <string>', 'id of your sd')
  .option('-compliance-id, --compliance-id <string>', '')
  .option('-ecosystem-url, --ecosystem-url <string>', 'URL of gx-compliance server')
  .option('-e, --ecosystem <string>', 'alias of your ecosystem')
  .action(async (cmd) => {})
