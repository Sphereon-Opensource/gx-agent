import { InvalidArgumentError, program } from 'commander'
import { getAgent } from './setup'
import { printTable } from 'console-table-printer'
import fs from 'fs'
import { IVerifySelfDescribedCredential } from '@sphereon/gx-compliance-client'

const participant = program.command('participant').description('Participant commands')
const compliance = participant.command('compliance').description('Compliance and self-descriptions')
const sd = participant.command('sd').description('Self-description commands')
compliance
  .command('compliance')
  .command('status')
  .description('shows the compliance status of the Participant')
  .option('--sd-id <string>', 'id of your self-description')
  .action(async (cmd) => {
    console.error('Feature not implemented yet')
  })

compliance
  .command('submit')
  .description('submits a self-description file to gx-compliance server')
  .option('--sd-file <string>', 'filesystem location of your self-description file')
  .option('--sd-id <string>', 'id of your self-description')
  .action(async (cmd) => {
    if (!cmd['sd-file'] && !cmd['sd-id']) {
      throw new InvalidArgumentError('sd-id or sd-file need to be provided')
    }
    const agent = await getAgent(program.opts().config)
    if (!cmd['sd-file']) {
      const selfDescription = await agent.acquireComplianceCredentialFromExistingParticipant({
        participantSDHash: cmd['sd-id'],
      })
      printTable([{ ...selfDescription }])
    } else {
      const sd = JSON.parse(fs.readFileSync(cmd['sd-file'], 'utf-8'))
      const selfDescription = await agent.acquireComplianceCredentialFromUnsignedParticipant({
        credential: sd,
      })
      printTable([{ ...selfDescription }])
    }
  })

sd.command('create')
  .description('creates a self-description based on your self-description input file')
  .option('--sd-input-file <string>', 'filesystem location of your self-description input file (a credential that is not signed)')
  .action(async (cmd) => {
    try {
      const agent = await getAgent(program.opts().config)
      const sd = JSON.parse(fs.readFileSync(cmd['sd-file'], 'utf-8'))
      const selfDescription = await agent.issueVerifiableCredential({
        ...sd,
      })
      printTable([{ ...selfDescription }])
    } catch (e: unknown) {
      console.error(e)
    }
  })

sd.command('verify')
  .description('verifies a self-description either by VC itself or by the vc id (hash) (experimental)')
  .option('--sd-id <string>', 'id of your sd')
  .option('--sd-file <string>', 'your sd file')
  .action(async (cmd) => {
    try {
      const agent = await getAgent(program.opts().config)
      const args: IVerifySelfDescribedCredential = {}
      if (cmd['sd-id']) {
        args['hash'] = cmd['sd-id']
      } else if (cmd['sd-file']) {
        args['verifiableCredential'] = JSON.parse(fs.readFileSync(cmd['sd-file'], 'utf-8'))
      }
      const result = await agent.verifySelfDescribedCredential(args)
      printTable([{ ...result }])
    } catch (e: unknown) {
      console.error(e)
    }
  })
