import { program } from 'commander'
import { printTable } from 'console-table-printer'
import fs from 'fs'
import { CredentialPayload, IIdentifier, VerifiableCredential } from '@veramo/core'
import { asDID, convertDidWebToHost, exportToDIDDocument, getAgent, getVcSubjectIdAsString, getVcType } from '@sphereon/gx-agent'
import nock from 'nock'

const vc = program.command('vc').description('Generic Verifiable Credential commands')

vc.command('issue')
  .description('Issues a Verifiable Credential using a Credential from an input file')
  .requiredOption('-f, --input-file <string>', 'File containing an unsigned credential')
  .option('-d, --did <string>', 'Use domain or did, otherwise will be deducted from the input credential issuer value')
  .option('-kid, --key-identifier <string>', 'Use a specific key identifier, otherwise will be deducted from the input credential issuer value')
  .option('-p, --persist', 'Persist the credential. If not provided the credential will not be stored in the agent')
  .option('--show', 'Print the Verifiable Credential to console')
  .action(async (cmd) => {
    const agent = await getAgent()
    try {
      const credential: CredentialPayload = JSON.parse(fs.readFileSync(cmd.inputFile, 'utf-8')) as CredentialPayload
      const did = cmd.did
        ? await asDID(cmd.did)
        : typeof credential.issuer === 'string'
        ? credential.issuer
        : credential.issuer
        ? credential.issuer.id
        : await asDID()
      const id = await agent.didManagerGet({ did })
      const didDoc = await exportToDIDDocument(id)
      const url = `https://${convertDidWebToHost(did)}`
      if (!credential.issuer) {
        credential.issuer = did
      }

      nock.cleanAll()
      nock(url)
        .get(`/.well-known/did.json`)
        .times(10)
        .reply(200, {
          ...didDoc,
        })

      const vc = await agent.issueVerifiableCredential({
        credential,
        keyRef: cmd.keyIdentifier,
        domain: did,
        persist: cmd.persist,
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
      if (cmd.show) {
        console.log(JSON.stringify(vc.verifiableCredential, null, 2))
      }
    } catch (e: any) {
      console.error(e.message)
      throw e
    } finally {
      nock.cleanAll()
    }
  })

vc.command('list')
  .description('Lists al persisted Verifiable Credentials')
  .option('-iss, --issuer <string>', 'domain or did of the issuer')
  .option(
    '-t, --type <string>',
    'Type of the VerifiableCredential you want to see. You can select from "LegalPerson", "ServiceOffering", "ParticipantCredential", "ServiceOfferingCredentialExperimental" or any other type that you\'ve saved via this agent'
  )
  .action(async (cmd) => {
    const agent = await getAgent()
    try {
      let uniqueCredentials = await agent.dataStoreORMGetVerifiableCredentials({
        order: [
          {
            column: 'issuanceDate',
            direction: 'ASC',
          },
        ],
      })
      if (cmd.issuer) {
        const issuer = await asDID(cmd.issuer)
        uniqueCredentials = uniqueCredentials.filter((uvc) => uvc.verifiableCredential.issuer === issuer)
      }
      if (cmd.type) {
        uniqueCredentials = uniqueCredentials.filter((uvc) => getVcType(uvc.verifiableCredential).trim() === (cmd.type as string).trim())
      }
      printTable(
        uniqueCredentials.map((vc) => {
          return {
            types: getVcType(vc.verifiableCredential),
            issuer: vc.verifiableCredential.issuer,
            subject: getVcSubjectIdAsString(vc.verifiableCredential),
            'issuance-date': vc.verifiableCredential.issuanceDate,
            id: vc.hash,
          }
        })
      )
    } catch (e: any) {
      console.error(e)
    }
  })

vc.command('verify')
  .description('Verifies a Verifiable Credential using a Credential from an input file or stored in the agent')
  .option('-f, --input-file <string>', 'File containing a Verifiable Credential')
  .option('-id, --vc-id <string>', 'Use a persisted VC as input for verification')
  .option('--show', 'Print the Verifiable Credential to console')
  .action(async (cmd) => {
    const agent = await getAgent()
    if (!cmd.inputFile && !cmd.vcId) {
      throw Error('Either a Verifiable Credential input file or the id of a stored Verifiable Credential needs to be supplied')
    } else if (cmd.inputFile && cmd.vcId) {
      throw Error('Cannot both have a Verifiable Credential input file and the id of a stored Verifiable Credential')
    }

    try {
      const verifiableCredential: VerifiableCredential = cmd.inputFile
        ? (JSON.parse(fs.readFileSync(cmd.inputFile, 'utf-8')) as VerifiableCredential)
        : await agent.dataStoreGetVerifiableCredential({ hash: cmd.vcId })

      const did = cmd.did
        ? await asDID(cmd.did)
        : typeof verifiableCredential.issuer === 'string'
        ? verifiableCredential.issuer
        : verifiableCredential.issuer
        ? verifiableCredential.issuer.id
        : await asDID()
      let id: IIdentifier | undefined
      try {
        id = await agent.didManagerGet({ did })

        const didDoc = await exportToDIDDocument(id)
        const url = `https://${convertDidWebToHost(did)}`

        nock.cleanAll()
        nock(url)
          .get(`/.well-known/did.json`)
          .times(10)
          .reply(200, {
            ...didDoc,
          })
      } catch (e) {
        // DID not hosted by us, which is fine
      }

      try {
        const result = await agent.checkVerifiableCredential({ verifiableCredential })

        printTable([
          {
            types: verifiableCredential.type!.toString().replace('VerifiableCredential,', ''),
            issuer: verifiableCredential.issuer,
            subject: verifiableCredential.credentialSubject.id,
            'issuance-date': verifiableCredential.issuanceDate,
            valid: JSON.stringify(result).toString(),
          },
        ])
      } catch (e: any) {
        console.error(e.message)
      }

      if (cmd.show === true) {
        console.log(JSON.stringify(verifiableCredential, null, 2))
      }
    } catch (e: any) {
      console.error(e.message)
    } finally {
      nock.cleanAll()
    }
  })
