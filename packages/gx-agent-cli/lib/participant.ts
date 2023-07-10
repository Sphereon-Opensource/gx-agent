import { InvalidArgumentError, program } from 'commander'

import { printTable } from 'console-table-printer'
import fs from 'fs'
import {
  asDID,
  createSDCredentialFromPayload,
  exampleParticipantSD1_2_8,
  ExportFileResult,
  getAgent,
  getVcSubjectIdAsString,
  getVcType,
  IVerifySelfDescribedCredential,
  VerifiableCredentialResponse,
} from '@sphereon/gx-agent'

const participant = program.command('participant').description('Participant commands')
const sd = participant.command('sd').alias('self-description').description('Participant self-description commands')

sd.command('submit')
  .description(
    'submits a self-description file to the compliance service. This can either be an input file (unsigned credential) from the filesystem, or a signed self-description stored in the agent'
  )
  .option('-sif, --sd-input-file <string>', 'Unsigned self-description input file location')
  .option('-sid, --sd-id <string>', 'id of a signed self-description stored in the agent')
  // .option('-p, --persist', 'Persist the credential. If not provided the VerifiablePresentation will not be stored in the agent')
  .option('--show', 'Show self descriptions')
  .action(async (cmd) => {
    try {
      if (!cmd.sdInputFile && !cmd.sdId) {
        throw new InvalidArgumentError('sd-id or sd-file needs to be provided')
      } else if (cmd.sdInputFile && cmd.sdId) {
        throw new InvalidArgumentError('sd-id and sd-file options cannot both be provided at the same time')
      }
      const agent = await getAgent()
      let selfDescription: VerifiableCredentialResponse
      if (cmd.sdId) {
        selfDescription = await agent.acquireComplianceCredentialFromExistingParticipant({
          participantSDId: cmd.sdId,
          persist: true,
          show: cmd.show,
        })
      } else {
        let sd = JSON.parse(fs.readFileSync(cmd.sdInputFile, 'utf-8'))
        if (!sd.credentialSubject) {
          const did = await asDID()
          sd = createSDCredentialFromPayload({ did, payload: sd })
        }
        selfDescription = await agent.acquireComplianceCredentialFromUnsignedParticipant({
          credential: sd,
          persist: true,
          show: cmd.show,
        })
      }

      printTable([
        {
          type: getVcType(selfDescription.verifiableCredential),
          issuer: selfDescription.verifiableCredential.issuer,
          subject: getVcSubjectIdAsString(selfDescription.verifiableCredential),
          'issuance-date': selfDescription.verifiableCredential.issuanceDate,
          id: selfDescription.hash,
        },
      ])

      if (cmd.show) {
        console.log(JSON.stringify(selfDescription, null, 2))
      }
    } catch (error: any) {
      console.error(error)
    }
  })

sd.command('verify')
  .description('verifies a self-description')
  .requiredOption('-id, --sd-id <string>', 'id of your self-description')
  .option('--show', 'Show self descriptions')
  .action(async (cmd) => {
    try {
      const agent = await getAgent()
      const args: IVerifySelfDescribedCredential = { show: cmd.show === true, id: cmd.sdId }

      const result = await agent.verifySelfDescription(args)
      printTable([{ verified: result.verified }])
    } catch (e: unknown) {
      console.error(e)
    }
  })

sd.command('example-input')
  .alias('example')
  .description('Creates an example participant self-description input credential file')
  .option('-d, --did <string>', 'the DID or domain which will be used')
  .option('-v, --version <string>', 'In this version we only support `v1.2.8`')
  .option('--show', 'Show self descriptions')
  .action(async (cmd) => {
    const did = await asDID(cmd.did)
    const typeStr = 'participant'
    const fileName = `${typeStr}-input-credential.json`
    const credential = exampleParticipantSD1_2_8({ did })
    fs.writeFileSync(fileName, JSON.stringify(credential, null, 2))
    printTable([{ type: typeStr, 'sd-file': fileName, did }])
    console.log(`Example self-description file has been written to ${fileName}. Please adjust the contents and use one of the onboarding methods`)
    if (cmd.show) {
      console.log(JSON.stringify(credential, null, 2))
    }
  })

export async function exportParticipant(cmd: any): Promise<ExportFileResult[]> {
  const did = await asDID(cmd.did)
  const typeStr = 'gx:LegalParticipant'
  const agent = await getAgent()
  const exportResult = await agent.exportVCsToPath({
    domain: did,
    hash: cmd.sdId,
    type: typeStr,
    includeVCs: true,
    includeVPs: true,
    exportPath: cmd.path,
  })
  return exportResult
}

sd.command('export')
  .description('Exports participant self-description(s) to disk')
  .option('-d, --did <string>', 'the DID or domain which will be used')
  .option('-sid, --sd-id <string>', 'id of your self-description')
  .option('-p, --path <string>', 'A base path to export the files to. Defaults to "exported"')
  .action(async (cmd) => {
    printTable(await exportParticipant(cmd))
    console.log(`Participant self-description file has been written to the above paths`)
  })

sd.command('list')
  .description('List participant self-description(s)')
  .option('-d, --did <string>', 'the domain which will be used')
  .option('--show', 'Show self descriptions')
  .action(async (cmd) => {
    try {
      const agent = await getAgent()
      const vcs = await agent.dataStoreORMGetVerifiableCredentials()
      const did = cmd.did ? await asDID(cmd.did) : undefined
      const sds = vcs.filter(
        (vc) => vc.verifiableCredential.credentialSubject['type'] === 'gx:LegalParticipant' && (!did || vc.verifiableCredential.issuer === did)
      )
      printTable(
        sds.map((sd) => {
          return {
            issuer: sd.verifiableCredential.issuer,
            subject: getVcSubjectIdAsString(sd.verifiableCredential),
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
        console.error(`Participant self-description with id ${id} not found`)
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
        console.error(`Participant self-description with id ${id} not found`)
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
      let sd = JSON.parse(fs.readFileSync(cmd.sdInputFile, 'utf-8'))
      if (!sd.credentialSubject) {
        const did = await asDID()
        sd = createSDCredentialFromPayload({ did, payload: sd })
      }
      if (!sd.credentialSubject.type.includes('LegalParticipant')) {
        throw new Error(
          'Self-description input file is not of the correct type. Please use `participant sd export-example-sd` command and update the content to create a correct input file'
        )
      }
      const selfDescription = await agent.issueVerifiableCredential({
        credential: sd,
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
