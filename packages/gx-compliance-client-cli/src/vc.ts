import { getAgent } from './setup'
import { program } from 'commander'
import { printTable } from 'console-table-printer'
import fs from 'fs'
import { CredentialPayload, IIdentifier, VerifiableCredential } from '@veramo/core'
import { convertDidWebToHost, exampleParticipantSD, exportToDIDDocument } from '@sphereon/gx-compliance-client'
import nock from 'nock'

const vc = program.command('vc').description('Generic Verifiable Credential and Presentation commands')

vc.command('export-example-sd')
  .description('Creates an example self-description input credential')
  .requiredOption('-d, --domain <string>', 'the domain which will be used')
  .requiredOption('-t, --type <string>', 'Credential type. One of: "participant" or "service-offering"')
  .action(async (cmd) => {
    const type = cmd.type.toLowerCase().includes('participant') ? 'participant' : 'service-offering'
    const fileName = `${type}-input-credential.json`
    //todo: service offering
    const credential =
      type === 'participant' ? exampleParticipantSD({ did: `did:web:${cmd.domain}` }) : exampleParticipantSD({ did: `did:web:${cmd.domain}` })
    fs.writeFileSync(fileName, JSON.stringify(credential, null, 2))
    printTable([{ type: type, 'sd-file': fileName, did: `did:web:${cmd.domain}` }])
    console.log(`Example self-description file has been written at ${fileName}. Please adjust the contents and use one of the onboarding methods`)
  })
vc.command('issue-credential')
  .description('Issues a Verifiable Credential using a Credential from an input file')
  .requiredOption('-f, --input-file <string>', 'File containing an unsigned credential')
  .option('-d, --domain <string>', 'Use domain, otherwise will be deducted from the input credential issuer value')
  .option('-kid, --key-identifier <string>', 'Use a specific key identifier, otherwise will be deducted from the input credential issuer value')
  .option('-p, --persist', 'Persist the credential. If not provided the credential will not be stored in the agent')
  .action(async (cmd) => {
    const agent = await getAgent(program.opts().config)
    try {
      const credential: CredentialPayload = JSON.parse(fs.readFileSync(cmd.inputFile, 'utf-8')) as CredentialPayload
      const did = cmd.domain ? `did:web:${cmd.domain}` : typeof credential.issuer === 'string' ? credential.issuer : credential.issuer.id
      const id = await agent.didManagerGet({ did })
      const didDoc = await exportToDIDDocument(id)
      const url = `https://${convertDidWebToHost(did)}`
      console.log(url)
      nock.cleanAll()
      nock(url)
        .get(`/.well-known/did.json`)
        .times(10)
        .reply(200, {
          ...didDoc
        })

      const vc = await agent.issueVerifiableCredential({
        credential,
        keyRef: cmd.keyIdentifier,
        domain: cmd.domain,
        persist: cmd.persist
      })
      printTable([
        {
          types: vc.verifiableCredential.type!.toString().replace('VerifiableCredential,', ''),
          issuer: vc.verifiableCredential.issuer,
          subject: vc.verifiableCredential.credentialSubject.id,
          'issuance-date': vc.verifiableCredential.issuanceDate,
          id: vc.hash,
          persisted: cmd.persisted === true
        }
      ])
      console.log(JSON.stringify(vc.verifiableCredential, null, 2))
    } catch (e: any) {
      console.error(e.message)
    } finally {
      nock.cleanAll()
    }
  })

vc.command('list-credentials')
  .description('Lists al persisted Verifiable Credentials')
  .action(async (cmd) => {
    const agent = await getAgent(program.opts().config)
    try {
      const uniqueCredentials = await agent.dataStoreORMGetVerifiableCredentials({
        order: [{
          column: 'issuanceDate',
          direction: 'ASC'
        }]
      })
      printTable(
        uniqueCredentials.map(vc => {
          return {
            types: vc.verifiableCredential.type!.toString().replace('VerifiableCredential,', ''),
            issuer: vc.verifiableCredential.issuer,
            subject: vc.verifiableCredential.credentialSubject.id,
            'issuance-date': vc.verifiableCredential.issuanceDate,
            id: vc.hash
          }
        })
      )
    } catch (e: any) {
      console.error(e.message)
    } finally {
      nock.cleanAll()
    }
  })


vc.command('verify-credential')
  .description('Issues a Verifiable Credential using a Credential from an input file')
  .option('-f, --input-file <string>', 'File containing a Verifiable Credential')
  .option('-id, --vc-id <string>', 'Use a persisted VC as input for verification')
  .option('--show', 'Print the Verifiable Credential to console')
  .action(async (cmd) => {
    const agent = await getAgent(program.opts().config)
    try {
      if (!cmd.inputFile && !cmd.vcId) {
        throw Error('Either a Verifiable Credential input file or the id of a stored Verifiable Credential needs to be supplied')
      } else if (cmd.inputFile && cmd.vcId) {
        throw Error('Cannot both have a Verifiable Credential input file and the id of a stored Verifiable Credential')
      }

      const verifiableCredential: VerifiableCredential = cmd.inputFile
        ? (JSON.parse(fs.readFileSync(cmd.inputFile, 'utf-8')) as VerifiableCredential)
        : await agent.dataStoreGetVerifiableCredential({ hash: cmd.vcId })

      const issuer = typeof verifiableCredential.issuer === 'string' ? verifiableCredential.issuer : verifiableCredential.issuer.id
      let id: IIdentifier | undefined
      try {
        id = await agent.didManagerGet({ did: issuer })
      } catch (e) {
        // DID not hosted by us, which is fine
      }

      if (id) {
        const didDoc = await exportToDIDDocument(id)
        const url = `https://${convertDidWebToHost(issuer)}`
        nock.cleanAll()
        nock(url)
          .get(`/.well-known/did.json`)
          .times(10)
          .reply(200, {
            ...didDoc
          })
      }
      const result = await agent.checkVerifiableCredential({ verifiableCredential })

      printTable([
        {
          types: verifiableCredential.type!.toString().replace('VerifiableCredential,', ''),
          issuer: verifiableCredential.issuer,
          subject: verifiableCredential.credentialSubject.id,
          'issuance-date': verifiableCredential.issuanceDate,
          valid: result
        }
      ])

      if (cmd.show === true) {
        console.log(JSON.stringify(verifiableCredential, null, 2))
      }
    } catch (e: any) {
      console.error(e.message)
    } finally {
      nock.cleanAll()
    }
  })
