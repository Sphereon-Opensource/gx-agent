import {InvalidArgumentError, program} from 'commander'
import { getAgent } from './setup'
import { printTable } from 'console-table-printer'
import fs from 'fs'

const participant = program.command('participant').description('gx-participant participant')

participant
  .command('compliance')
  .command('submit')
  .description('submits a self-description file to gx-compliance server')
  .option('-sd-file <string>, --sd-file <string>', 'filesystem location of your sd-file')
  .option('-sd-id <string>, --sd-id <string>', 'id of your sd')
  .action(async (cmd) => {
    if(!cmd['sd-file'] && !cmd['sd-id']) {
      throw new InvalidArgumentError('sd-id or sd-file need to be provided')
    }
    const agent = getAgent(program.opts().config)
    //FIXME it makes more sense to move this to plugin since we need to call additional agent methods to retrieve key/did info

    // Beginning
    const participantVChash = cmd['sd-id']
    const sd = JSON.parse(fs.readFileSync(cmd['sd-file'], 'utf-8')) || await agent.dataStoreGetVerifiableCredential({
      hash: participantVChash
    })
    const did = sd.credentialSubject.id as string
    const didResolutionResult = await agent.resolveDid({ didUrl: did })
    if (!didResolutionResult.didDocument?.verificationMethod) {
      throw new InvalidArgumentError("There is no verification method")
    }
    const verificationMethodId = didResolutionResult.didDocument.verificationMethod[0].id as string
    const keyRef = (await agent.didManagerGet({ did })).keys[0].kid
    // End

    if (!cmd['sd-file']) {
      const selfDescription = await agent.acquireComplianceCredentialFromExistingParticipant({
        participantVChash,
        purpose: sd.proof.proofPurpose,
        challenge: sd.proof.challenge,
        verificationMethodId,
        keyRef
      })
      printTable([{ ...selfDescription }])
    } else {
      const selfDescription = await agent.acquireComplianceCredentialFromUnsignedParticipant({
        purpose: sd.proof.proofPurpose,
        verificationMethodId,
        keyRef,
        credential: sd
      })
      printTable([{ ...selfDescription }])
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
  .option('-sd-id <string>, --sd-id <string>', 'id of your sd')
  .action(async (cmd) => {
    try {
      const hash = cmd['sd-id']
      const agent = getAgent(program.opts().config)
      const sd = await agent.dataStoreGetVerifiableCredential({
        hash
      })
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

