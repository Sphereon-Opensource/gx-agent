import { InvalidArgumentError, program } from 'commander'
import { getAgent } from './setup'
import { printTable } from 'console-table-printer'
import fs from 'fs'
import { exampleParticipantSD, exampleParticipantSO, IVerifySelfDescribedCredential } from '@sphereon/gx-compliance-client'

const participant = program.command('participant').description('Participant commands')
const compliance = participant.command('compliance').description('Compliance and self-descriptions')
const sd = participant.command('sd').description('Participant self-description commands')
compliance
  .command('compliance')
  .command('status')
  .description('shows the compliance status of the Participant')
  .option('-sid, --sd-id <string>', 'id of your self-description')
  .action(async (cmd) => {
    console.error('Feature not implemented yet')
  })

compliance
  .command('submit')
  .description(
    'submits a self-description file to the compliance service. This can either be an input file (unsigned credential) from the filesystem, or a signed self-description stored in the agent'
  )
  .option('-sif, --sd-input-file <string>', 'Unsigned self-description input file location')
  .option('-sid, --sd-id <string>', 'id of a signed self-description stored in the agent')
  .action(async (cmd) => {
    try {
      if (!cmd.sdInputFile && !cmd.sdId) {
        throw new InvalidArgumentError('sd-id or sd-file needs to be provided')
      } else if (cmd.sdInputFile && cmd.sdId) {
        throw new InvalidArgumentError('sd-id and sd-file options cannot both be provided at the same time')
      }
      const agent = await getAgent(program.opts().config)
      if (cmd.sdId) {
        const selfDescription = await agent.acquireComplianceCredentialFromExistingParticipant({
          participantSDId: cmd.sdId,
        })
        printTable([{ ...selfDescription }])
      } else {
        const sd = JSON.parse(fs.readFileSync(cmd.sdInputFile, 'utf-8'))
        const selfDescription = await agent.acquireComplianceCredentialFromUnsignedParticipant({
          credential: sd,
        })
        printTable([{ ...selfDescription }])
      }
    } catch (error: any) {
      console.error(error.message)
    }
  })

compliance
  .command('verify')
  .description('verifies a self-description either by VC itself or by the vc id (id) (experimental)')
  .option('-id, --sd-id <string>', 'id of your self-description')
  // .option('-sf, --sd-file <string>', 'your sd file')
  .action(async (cmd) => {
    try {
      const agent = await getAgent(program.opts().config)
      const args: IVerifySelfDescribedCredential = {}
      if (cmd.sdId) {
        args.id = cmd.sdId
        /*} else if (cmd.sdFile) {
        args.verifiableCredential = JSON.parse(fs.readFileSync(cmd.sdFile, 'utf-8'))*/
      }
      const result = await agent.verifySelfDescription(args)
      printTable([{ ...result }])
    } catch (e: unknown) {
      console.error(e)
    }
  })

sd.command('export-example-sd')
  .description('Creates an example self-description input credential file')
  .requiredOption('-d, --domain <string>', 'the domain which will be used')
  .requiredOption('-t, --type <string>', 'Credential type. One of: "participant" or "service-offering"')
  .action(async (cmd) => {
    const type = cmd.type.toLowerCase().includes('participant') ? 'participant' : 'service-offering'
    const fileName = `${type}-input-credential.json`
    const credential =
      type === 'participant'
        ? exampleParticipantSD({ did: `did:web:${cmd.domain}` })
        : exampleParticipantSO({ did: `did:web:${cmd.domain}` }, cmd.domain)
    fs.writeFileSync(fileName, JSON.stringify(credential, null, 2))
    printTable([{ type: type, 'sd-file': fileName, did: `did:web:${cmd.domain}` }])
    console.log(`Example self-description file has been written at ${fileName}. Please adjust the contents and use one of the onboarding methods`)
  })

sd.command('create')
  .description('creates a signed self-description based on your self-description input file')
  .requiredOption('-sif, --sd-input-file <string>', 'filesystem location of your self-description input file (a credential that is not signed)')
  .option('--show', 'Show the resulting self-description Verifiable Credential')
  .action(async (cmd) => {
    try {
      const agent = await getAgent(program.opts().config)
      const sd = JSON.parse(fs.readFileSync(cmd.sdInputFile, 'utf-8'))
      if (!sd.type.includes('LegalPerson')) {
        throw new Error(
          'Self-description input file is not of the correct type. Please use `participant sd export-example-sd` command and update the content to create a correct input file'
        )
      }
      const selfDescription = await agent.issueVerifiableCredential({
        ...sd,
        persist: true,
      })
      printTable([{ ...selfDescription }])
      if (cmd.show) {
        console.log(JSON.stringify(cmd.show, null, 2))
      }
    } catch (e: unknown) {
      console.error(e)
    }
  })
