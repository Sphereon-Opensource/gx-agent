import { program } from 'commander'
import {getAgent} from "./setup";
import { printTable } from 'console-table-printer'
import fs from 'fs'
import { IGetComplianceCredentialFromUnsignedParticipantArgs } from "@sphereon/gx-agent-compliance-client";

const participant = program.command('participant').description('gx participant')

participant
  .command('compliance')
  .command('submit')
  .description('submits a self-description file to gx-compliance server')
  .requiredOption('-sd-file, --sd-file <string>', 'filesystem location of your sd-file')
  .requiredOption('-sd-id, --sd-id <string>', 'id of your sd')
  .action(async (cmd) => {
    try {
      const sd = fs.readFileSync(cmd['sd-file'], 'utf-8') as IGetComplianceCredentialFromUnsignedParticipantArgs
      const agent = getAgent(program.opts().config)
      const selfDescription = await agent.getComplianceCredentialFromUnsignedParticipant({
        ...sd,
        id: cmd['sd-id']
      })
      printTable([{...selfDescription}])
    } catch(e:unknown) {
      console.error(e)
    }
  })

participant
  .command('self-description')
  .command('create')
  .description('creates a self-description file based on your self-description file')
  .option('-sd-file, --sd-file <string>', 'filesystem location of your sd-file')
  .action(async (cmd) => {
    try {
      const sd = fs.readFileSync(cmd['sd-file'], 'utf-8') as IGetComplianceCredentialFromUnsignedParticipantArgs
      const agent = getAgent(program.opts().config)
      const selfDescription = await agent.issueVerifiableCredential({
        ...sd
      })
      printTable([{...selfDescription}])
    } catch(e:unknown) {
      console.error(e)
    }
  })

participant
  .command('self-description')
  .command('verify')
  .description('verifies a self-description file (by a external call to gx-compliance server)')
  .option('-sd-file, --sd-file <string>', 'filesystem location of your sd-file')
  .action(async (cmd) => {
    try {
      const sd = fs.readFileSync(cmd['sd-file'], 'utf-8') as IGetComplianceCredentialFromUnsignedParticipantArgs
      const result = await (await fetch('http://v2206/api/participant/verify', {
        method: 'POST',
        body: JSON.stringify(sd),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      })).json()
      printTable([{...result}])
    } catch(e:unknown) {
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

participant
  .command('ecosystem')
  .command('submit')
  .description('Onboards the participant to the new ecosystem')
  .option('-sd-id, --sd-id <string>', 'id of your sd')
  .option('-compliance-id, --compliance-id <string>', '')
  .option('-ecosystem-url, --ecosystem-url <string>', 'URL of gx-compliance server')
  .option('-e, --ecosystem <string>', 'alias of your ecosystem')
  .action(async (cmd) => {})
