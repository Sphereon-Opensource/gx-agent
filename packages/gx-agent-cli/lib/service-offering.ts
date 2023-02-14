import { program } from 'commander'

import { printTable } from 'console-table-printer'
import fs from 'fs'
import {
  asDID,
  convertDidWebToHost,
  exampleServiceOfferingSD,
  exampleServiceOfferingSD2210,
  getAgent,
  IVerifySelfDescribedCredential,
  ServiceOfferingType,
} from '@sphereon/gx-agent'
import { CredentialPayload } from '@veramo/core'

const service = program.command('so').alias('service').alias('service-offering').description('Service Offering commands')
// const compliance = participant.command('compliance').description('Compliance and self-descriptions')
const serviceOffering = service.command('sd').alias('self-description').description('Service offering self-description commands')

serviceOffering
  .command('submit')
  .description(
    'submits a service offering self-description file to the compliance service. This can either be an input file (unsigned credential) from the filesystem, or a signed self-description stored in the agent'
  )
  .option('-sof, --so-input-file <string>', 'Unsigned ServiceOffering self-description input file location')
  .option('-soi, --so-id <string>', 'id of a signed ServiceOffering self-description stored in the agent')
  .requiredOption('-sid, --sd-id <string>', 'ID of your self-description verifiable credential')
  .requiredOption('-cid, --compliance-id <string>', 'ID of your compliance credential from Gaia-X compliance')
  .option('-p, --persist', 'Persist the credential. If not provided the credential will not be stored in the agent')
  .option('-s, --show', 'Show service offering')
  .action(async (cmd) => {
    const agent = await getAgent()
    if (!cmd.soInputFile && !cmd.soId) {
      throw Error('Verifiable Credential ID or file for self-description need to be selected. Please check parameters')
    }
    let soVcId = cmd.soId
    try {
      if (cmd.soInputFile) {
        const credential: CredentialPayload = JSON.parse(fs.readFileSync(cmd.soInputFile, 'utf-8')) as CredentialPayload
        const did = typeof credential.issuer === 'string' ? credential.issuer : credential.issuer ? credential.issuer.id : await asDID()
        const vc = await agent.issueVerifiableCredential({
          credential,
          keyRef: cmd.keyIdentifier,
          domain: did,
          persist: true,
        })
        soVcId = vc.hash
        printTable([
          {
            types: vc.verifiableCredential.type!.toString().replace('VerifiableCredential,', ''),
            issuer: vc.verifiableCredential.issuer,
            subject: vc.verifiableCredential.credentialSubject.id,
            'issuance-date': vc.verifiableCredential.issuanceDate,
            id: vc.hash,
            persisted: true,
          },
        ])
      }
      const vc = await agent.createAndSubmitServiceOffering({
        serviceOfferingId: soVcId,
        participantId: cmd.sdId,
        complianceId: cmd.complianceId,
        persist: cmd.persist === true,
        show: cmd.show === true,
      })
      printTable([
        {
          types: vc.verifiableCredential.type!.toString().replace('VerifiableCredential,', ''),
          issuer: vc.verifiableCredential.issuer,
          subject: vc.verifiableCredential.credentialSubject.id,
          'issuance-date': vc.verifiableCredential.issuanceDate,
          id: vc.hash,
          persisted: cmd.persist === true,
        },
      ])
    } catch (error: any) {
      console.error(error.message)
    }
  })

serviceOffering
  .command('verify')
  .description('verifies a service-offering self-description')
  .option('-id, --sd-id <string>', 'id of your self-description')
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

serviceOffering
  .command('export-example')
  .description('Creates an example service-offering self-description input credential file')
  .option('-d, --did <string>', 'the DID or domain which will be used')
  .option(
    '-v, --version <string>',
    "Version of SelfDescription object you want to create: 'v2206', or 'v2210', if no version provided, it will default to `v2210`"
  )
  .option(
    '-t, --type <string>',
    `ServiceOffering type is mandatory of you select latest version. Type can be chosen from this list: ${Object.keys(ServiceOfferingType).map(
      (key) => ' ' + key
    )}`
  )
  .option('-s, --show', 'Show self descriptions')
  .action(async (cmd) => {
    const did = await asDID(cmd.did)
    const typeStr = 'service-offering'
    const fileName = `service-offering-input-credential.json`
    let credential
    // @ts-ignore
    console.log(ServiceOfferingType[cmd.type])
    const url = `https://${convertDidWebToHost(did)}`
    if (cmd.version && cmd.version === 'v2206') {
      credential = exampleServiceOfferingSD({
        did,
        url,
      })
    } else if ((!cmd.version && !cmd.type) || (cmd.version === 'latest' && !cmd.type)) {
      console.error('for v2210 version, you should provide type.')
    } else if ((!cmd.version || cmd.version === 'latest') && cmd.type) {
      console.log("IMPORTANT: the values specified with '*' should be populated by you.")
      // @ts-ignore
      credential = exampleServiceOfferingSD2210({ url, did, type: ServiceOfferingType[cmd.type] })
    }
    fs.writeFileSync(fileName, JSON.stringify(credential, null, 2))
    printTable([{ type: typeStr, 'sd-file': fileName, did }])
    console.log(
      `Example service-offering self-description file has been written to ${fileName}. Please adjust the contents and use one of the onboarding methods`
    )
    if (cmd.show) {
      console.log(JSON.stringify(credential, null, 2))
    }
  })

serviceOffering
  .command('list')
  .description('List service-offering self-description(s)')
  .option('-d, --did <string>', 'the DID or domain which will be used')
  .option('-s, --show', 'Show self-descriptions')
  .action(async (cmd) => {
    try {
      const agent = await getAgent()
      const vcs = await agent.dataStoreORMGetVerifiableCredentials()
      const did = cmd.did ? await asDID(cmd.did) : undefined
      const sds = vcs.filter((vc) => vc.verifiableCredential.type!.includes('ServiceOffering') && (!did || vc.verifiableCredential.issuer === did))
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

serviceOffering
  .command('show')
  .description('List service-offering self-description(s)')
  .argument('<id>', 'The service-offering self-description id')
  .action(async (id) => {
    try {
      const agent = await getAgent()
      const vc = await agent.dataStoreGetVerifiableCredential({ hash: id })
      if (!vc) {
        console.error(`Service offering self-description with id ${id} not found`)
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

serviceOffering
  .command('delete')
  .description('Delete service offering self-description(s)')
  .argument('<id>', 'The service offering self-description id')
  .action(async (id) => {
    try {
      const agent = await getAgent()
      const vc = await agent.dataStoreDeleteVerifiableCredential({ hash: id })
      if (!vc) {
        console.log(`Service offering self-description with id ${id} not found`)
      } else {
        console.log(`Service offering self-description with id ${id} deleted`)
      }
    } catch (e: unknown) {
      console.error(e)
    }
  })

serviceOffering
  .command('create')
  .description('creates a signed self-description based on your self-description input file')
  .requiredOption('-sif, --sd-input-file <string>', 'filesystem location of your self-description input file (a credential that is not signed)')
  .option('--show', 'Show the resulting self-description Verifiable Credential')
  .action(async (cmd) => {
    try {
      const agent = await getAgent()
      const sd = JSON.parse(fs.readFileSync(cmd.sdInputFile, 'utf-8'))
      if (!sd.type.includes('ServiceOffering')) {
        throw new Error(
          'Self-description input file is not of the correct type. Please use `gx-agent so export-example` command and update the content to create a correct input file'
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
