import { InvalidArgumentError, program } from 'commander'
import { getAgent } from './setup'
import { GxEntityType } from './types'
import { printTable } from 'console-table-printer'

const ecosystem = program.command('ecosystem').description('gx-participant ecosystem')

ecosystem
  .command('add')
  .description('Adds a new Gaia-x ecosystem to the client')
  .requiredOption('-n, --name <string>', 'ecosystem name')
  .requiredOption('-url, --ecosystem-url <string>', 'gaia-x ecosystem server address')
  .action(async (cmd) => {
    const agent = getAgent(program.opts().config)
    const id = await agent.dataStoreSaveMessage({
      message: {
        id: cmd.name,
        type: GxEntityType.ecosystem,
        createdAt: new Date().toUTCString(),
        data: {
          name: cmd.name,
          'ecosystem-url': cmd['ecosystem-url'],
        },
      },
    })
    printTable([{ id }])
  })

ecosystem
  .command('submit')
  .description('Onboards the participant to the new ecosystem')
  .option('-sd-id, --sd-id <string>', 'id of your sd')
  .option('-compliance-id, --compliance-id <string>', '')
  .option('-ecosystem-url, --ecosystem-url <string>', 'URL of gx-compliance server')
  .option('-e, --ecosystem <string>', 'alias of your ecosystem')
  .action(async (cmd) => {
    try {
      const agent = getAgent(program.opts().config)
      const participantVChash = cmd['sd-id']
      const complianceVChash = cmd['compliance-id']

      //FIXME it makes more sense to move this to GaiaxComplianceClient since we need to call additional agent methods to retrieve key/did info

      // Beginning
      const sd = await agent.dataStoreGetVerifiableCredential({
        hash: participantVChash,
      })
      const did = sd.credentialSubject.id as string
      const didResolutionResult = await agent.resolveDid({ didUrl: did })
      if (!didResolutionResult.didDocument?.verificationMethod) {
        throw new InvalidArgumentError('There is no verification method')
      }
      const verificationMethodId = didResolutionResult.didDocument.verificationMethod[0].id as string
      const keyRef = (await agent.didManagerGet({ did })).keys[0].kid
      //End
      const selfDescription = await agent.onboardParticipantWithCredentialIds({
        verificationMethodId,
        selfDescribedVcHash: participantVChash,
        complianceCredentialHash: complianceVChash,
        purpose: sd.proof.purpose,
        challenge: sd.proof.challenge,
        keyRef,
      })
      printTable([{ ...selfDescription }])
    } catch (e: unknown) {
      console.error(e)
    }
  })
