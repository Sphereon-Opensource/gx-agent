import { InvalidArgumentError, program } from 'commander'

import { printTable } from 'console-table-printer'
import fs from 'fs'
import {
  asDID,
  convertDidWebToHost,
  exampleParticipantSD,
  exampleServiceOfferingSD,
  getAgent,
  IVerifySelfDescribedCredential,
} from '@sphereon/gx-agent'

const participant = program.command('participant').description('Participant commands')
const sd = participant.command('sd').alias('self-description').description('Participant self-description commands')

sd.command('submit')
  .description(
    'submits a self-description file to the compliance service. This can either be an input file (unsigned credential) from the filesystem, or a signed self-description stored in the agent'
  )
  .option('-sif, --sd-input-file <string>', 'Unsigned self-description input file location')
  .option('-sid, --sd-id <string>', 'id of a signed self-description stored in the agent')
  .option('-s, --show', 'Show self descriptions')
  .action(async (cmd) => {
    try {
      if (!cmd.sdInputFile && !cmd.sdId) {
        throw new InvalidArgumentError('sd-id or sd-file needs to be provided')
      } else if (cmd.sdInputFile && cmd.sdId) {
        throw new InvalidArgumentError('sd-id and sd-file options cannot both be provided at the same time')
      }
      const agent = await getAgent()
      const selfDescription = cmd.sdId
        ? await agent.acquireComplianceCredentialFromExistingParticipant({
            participantSDId: cmd.sdId,
          })
        : await agent.acquireComplianceCredentialFromUnsignedParticipant({
            credential: JSON.parse(fs.readFileSync(cmd.sdInputFile, 'utf-8')),
          })

      printTable([
        {
          type: selfDescription.verifiableCredential.type!.toString(),
          issuer: selfDescription.verifiableCredential.issuer,
          subject: selfDescription.verifiableCredential.credentialSubject.id,
          'issuance-date': selfDescription.verifiableCredential.issuanceDate,
          id: selfDescription.hash,
        },
      ])

      if (cmd.show) {
        console.log(JSON.stringify(selfDescription, null, 2))
      }
    } catch (error: any) {
      console.error(error.message)
    }
  })

sd.command('verify')
  .description('verifies a self-description')
  .requiredOption('-sid, --sd-id <string>', 'id of your self-description')
  .option('-s, --show', 'Show self descriptions')
  // .option('-sf, --sd-file <string>', 'your sd file')
  .action(async (cmd) => {
    try {
      const agent = await getAgent()
      const args: IVerifySelfDescribedCredential = { show: cmd.show, id: cmd.sdId }

      const result = await agent.verifySelfDescription(args)
      printTable([{ conforms: result.conforms }])
    } catch (e: unknown) {
      console.error(e)
    }
  })

sd.command('export-example')
  .description('Creates an example participant self-description input credential file')
  // .argument('<type>', 'Credential type. One of: "participant" or "service-offering"')
  .option('-d, --did <string>', 'the DID or domain which will be used')
  .option('-s, --show', 'Show self descriptions')
  .action(async (cmd) => {
    const did = await asDID(cmd.did)
    const typeStr = 'participant' //type.toLowerCase().includes('participant') ? 'participant' : 'service-offering'
    const fileName = `${typeStr}-input-credential.json`
    const credential =
      typeStr === 'participant'
        ? exampleParticipantSD({ did })
        : exampleServiceOfferingSD({
            did,
            url: `https://${convertDidWebToHost(did)}`,
          })
    fs.writeFileSync(fileName, JSON.stringify(credential, null, 2))
    printTable([{ type: typeStr, 'sd-file': fileName, did }])
    console.log(`Example self-description file has been written to ${fileName}. Please adjust the contents and use one of the onboarding methods`)
    if (cmd.show) {
      console.log(JSON.stringify(credential, null, 2))
    }
  })

sd.command('list')
  .description('List participant self-description(s)')
  .option('-d, --did <string>', 'the domain which will be used')
  .option('-s, --show', 'Show self descriptions')
  .action(async (cmd) => {
    try {
      const agent = await getAgent()
      const vcs = await agent.dataStoreORMGetVerifiableCredentials()
      const did = cmd.did ? await asDID(cmd.did) : undefined
      const sds = await vcs.filter(
        (vc) => vc.verifiableCredential.type!.includes('LegalPerson') && (!did || vc.verifiableCredential.issuer === did)
        // vc?.verifiableCredential?.type?.includes('LegalPerson') && (!cmd.domain || vc.verifiableCredential.issuer === (await asDID(cmd.domain)))
      )
      printTable(
        sds.map((sd) => {
          return {
            issuer: sd.verifiableCredential.issuer,
            subject: sd.verifiableCredential.id,
            'issuance-data': sd.verifiableCredential.issuanceDate,
            id: sd.hash,
          }
        })
      )

      if (cmd.show) {
        sds.map((sd) => {
          console.log(`id: ${sd.hash}\n${JSON.stringify(sd.verifiableCredential, null, 2)}`)
        })
      }
    } catch (e: unknown) {
      console.error(e)
    }
  })

sd.command('show')
  .description('List participant self-description(s)')
  .argument('<id>', 'The participant self-description id')
  .action(async (id) => {
    try {
      const agent = await getAgent()
      const vc = await agent.dataStoreGetVerifiableCredential({ hash: id })
      if (!vc) {
        console.log(`Participant self-description with id ${id} not found`)
      } else {
        printTable([
          {
            issuer: vc.issuer,
            subject: vc.id,
            'issuance-data': vc.issuanceDate,
            id: vc.hash,
          },
        ])
        console.log(`id: ${id}\n${JSON.stringify(vc, null, 2)}`)
      }
    } catch (e: unknown) {
      console.error(e)
    }
  })

sd.command('delete')
  .description('Delete participant self-description(s)')
  .argument('<id>', 'The participant self-description id')
  .action(async (id) => {
    try {
      const agent = await getAgent()
      const vc = await agent.dataStoreDeleteVerifiableCredential({ hash: id })
      if (!vc) {
        console.log(`Participant self-description with id ${id} not found`)
      } else {
        console.log(`Participant self-description with id ${id} deleted`)
      }
    } catch (e: unknown) {
      console.error(e)
    }
  })

sd.command('create')
  .description('creates a signed self-description based on your self-description input file')
  .requiredOption('-sif, --sd-input-file <string>', 'filesystem location of your self-description input file (a credential that is not signed)')
  .option('--show', 'Show the resulting self-description Verifiable Credential')
  .action(async (cmd) => {
    try {
      const agent = await getAgent()
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
