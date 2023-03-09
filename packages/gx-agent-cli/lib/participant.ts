import { InvalidArgumentError, program } from 'commander'

import { printTable } from 'console-table-printer'
import fs from 'fs'
import {
  asDID,
  createSDCredentialFromPayload,
  exampleParticipantSD,
  exampleParticipantSD2210,
  ExportFileResult,
  getAgent,
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
  .option('-p, --persist', 'Persist the credential. If not provided the VerifiablePresentation will not be stored in the agent')
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
          persist: cmd.persist,
          show: cmd.show,
        })
      }

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
      console.error(error)
    }
  })

sd.command('verify')
  .description('verifies a self-description')
  .requiredOption('-sid, --sd-id <string>', 'id of your self-description')
  .option('--show', 'Show self descriptions')
  .action(async (cmd) => {
    try {
      const agent = await getAgent()
      const args: IVerifySelfDescribedCredential = { show: cmd.show === true, id: cmd.sdId }

      const result = await agent.verifySelfDescription(args)
      printTable([{ conforms: result.conforms }])
    } catch (e: unknown) {
      console.error(e)
    }
  })

sd.command('example-input')
  .alias('example')
  .description('Creates an example participant self-description input credential file')
  .option('-d, --did <string>', 'the DID or domain which will be used')
  .option(
    '-v, --version <string>',
    "Version of SelfDescription object you want to create: 'v2206', or 'v2210', if no version provided, it will default to `v2210`"
  )
  .option('--show', 'Show self descriptions')
  .action(async (cmd) => {
    const did = await asDID(cmd.did)
    const typeStr = 'participant'
    const fileName = `${typeStr}-input-credential.json`
    const credential = cmd.version && cmd.version === 'v2206' ? exampleParticipantSD({ did }) : exampleParticipantSD2210({ did })
    fs.writeFileSync(fileName, JSON.stringify(credential, null, 2))
    printTable([{ type: typeStr, 'sd-file': fileName, did }])
    console.log(`Example self-description file has been written to ${fileName}. Please adjust the contents and use one of the onboarding methods`)
    if (cmd.show) {
      console.log(JSON.stringify(credential, null, 2))
    }
  })

sd.command('wizard-credential')
  .description(
    'Takes data from the SD Creation Wizard and creates a SD Credential out of it. Link to the wizard: https://sd-creation-wizard.gxfs.dev/'
  )
  .option('-d, --did <string>', 'the DID or domain which will be used')
  .requiredOption('-sif, --sd-input-file <string>', 'filesystem location of the SD Wizard file you downloaded)')
  .option('--show', 'Show the resulting self-description Verifiable Credential')
  .action(async (cmd) => {
    const did = await asDID(cmd.did)
    const payload = JSON.parse(fs.readFileSync(cmd.sdInputFile, 'utf-8'))
    const credential = createSDCredentialFromPayload({ did, payload })
    const fileName = `${cmd.sdInputFile.replace('.json', '')}-sd-credential.json`
    fs.writeFileSync(fileName, JSON.stringify(credential, null, 2))
    printTable([{ 'credential file': fileName, did }])
    console.log(
      `SD Wizard file has been converted to a self-description credential file and written to ${fileName}. Please check and adjust the contents and use one of the onboarding methods`
    )
    if (cmd.show) {
      console.log(JSON.stringify(credential, null, 2))
    }
  })

export async function exportParticipant(cmd: any): Promise<ExportFileResult[]> {
  const did = await asDID(cmd.did)
  const typeStr = 'LegalPerson'
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
        (vc) =>
          (vc.verifiableCredential.type!.includes('LegalPerson') ||
            vc.verifiableCredential.credentialSubject['@type'] === 'gax-trust-framework:LegalPerson') &&
          (!did || vc.verifiableCredential.issuer === did)
      )
      printTable(
        sds.map((sd) => {
          return {
            issuer: sd.verifiableCredential.issuer,
            subject: sd.verifiableCredential.credentialSubject.id,
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
  .option('-s --show', 'Show the resulting self-description Verifiable Credential')
  .action(async (cmd) => {
    try {
      const agent = await getAgent()
      let sd = JSON.parse(fs.readFileSync(cmd.sdInputFile, 'utf-8'))
      if (!sd.credentialSubject) {
        const did = await asDID()
        sd = createSDCredentialFromPayload({ did, payload: sd })
      }
      if (!sd.type.includes('LegalPerson') && sd.credentialSubject['@type'] !== 'gax-trust-framework:LegalPerson') {
        throw new Error(
          'Self-description input file is not of the correct type. Please use `participant sd export-example-sd` or `participant sd sd-wizard-credential` commands and update the content to create a correct input file'
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
