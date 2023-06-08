import { program } from 'commander'
import { printTable } from 'console-table-printer'
import fs from 'fs'
import { IIdentifier, UniqueVerifiablePresentation, VerifiableCredential, VerifiablePresentation } from '@veramo/core'
import { asDID, convertDidWebToHost, exportToDIDDocument, getAgent, getVcType } from '@sphereon/gx-agent'
import nock from 'nock'

const vp = program.command('vp').description('Generic Verifiable Presentation commands')

vp.command('list')
  .description('Lists all persisted Verifiable Presentations')
  .action(async (cmd) => {
    const agent = await getAgent()
    try {
      const uniqueVPs = await agent.dataStoreORMGetVerifiablePresentations({
        order: [
          {
            column: 'issuanceDate',
            direction: 'ASC',
          },
        ],
      })
      printTable(
        uniqueVPs.map((vp: UniqueVerifiablePresentation) => {
          return {
            types: vp.verifiablePresentation.verifiableCredential!.map((vc) => getVcType(vc as VerifiableCredential)).toString(),
            issuer: vp.verifiablePresentation.proof.verificationMethod,
            holder: vp.verifiablePresentation.holder,
            'issuance-date': vp.verifiablePresentation.proof.created,
            id: vp.hash,
          }
        })
      )
    } catch (e: any) {
      console.error(e.message)
    }
  })

vp.command('verify')
  .description('Verify a Verifiable Presentation from file or agent id')
  .option('-f, --input-file <string>', 'File containing a Verifiable Presentation')
  .option('-id, --vc-id <string>', 'Use a persisted VP in the agent as input for verification')
  .option('--show', 'Print the Verifiable Presentation to console')
  .action(async (cmd) => {
    const agent = await getAgent()
    try {
      if (!cmd.inputFile && !cmd.vcId) {
        throw Error('Either a Verifiable Presentation input file or the id of a stored Verifiable Presentation needs to be supplied')
      } else if (cmd.inputFile && cmd.vcId) {
        throw Error('Cannot both have a Verifiable Presentation input file and the id of a stored Verifiable Presentation')
      }

      const verifiablePresentation: VerifiablePresentation = cmd.inputFile
        ? (JSON.parse(fs.readFileSync(cmd.inputFile, 'utf-8')) as VerifiablePresentation)
        : await agent.dataStoreGetVerifiablePresentation({ hash: cmd.vcId })

      let id: IIdentifier | undefined
      try {
        id = await agent.didManagerGet({ did: verifiablePresentation.holder })
        const didDoc = await exportToDIDDocument(id)
        const url = `https://${convertDidWebToHost(verifiablePresentation.holder)}`
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

      const result = await agent.checkVerifiablePresentation({ verifiablePresentation, show: cmd.show === true })

      printTable([
        {
          types: verifiablePresentation
            .verifiableCredential!.map((vc) => (vc as VerifiableCredential).type!.toString().replace('VerifiableCredential,', ''))
            .toString(),
          issuer: verifiablePresentation.proof.verificationMethod,
          holder: verifiablePresentation.holder,
          'issuance-date': verifiablePresentation.proof.created,
          valid: result,
        },
      ])

      if (cmd.show === true) {
        console.log(JSON.stringify(verifiablePresentation, null, 2))
      }
    } catch (e: any) {
      console.error(e.message)
    } finally {
      nock.cleanAll()
    }
  })

vp.command('issue')
  .description('Issues a Verifiable Presentation using Credentials from input file(s) and/or stored in th eagent')
  .requiredOption('-d, --did <string>', 'Use domain or did')
  .option('-ids, --vc-ids <string...>', '1 or more Verifiable Credential IDS stored in the agent')
  .option('-f, --vc-files <string...>', 'File(s) containing Verifiable Credentials')
  .option('-c, --challenge <string>', 'Use a challenge')
  .option('-t, --target-domain <string>', 'Target domain, used to protect against replay attacks')
  .option('-p, --persist', 'Persist the presentation. If not provided the presentation will not be stored in the agent')
  .option('--show', 'Print the Verifiable Presentation to console')

  .action(async (cmd) => {
    const agent = await getAgent()
    if (!cmd.vcFiles && !cmd.vcIds) {
      throw Error('Verifiable Credential IDs or files need to be selected. Please check parameters')
    }
    try {
      const fileVCs = cmd.vcFiles
        ? (cmd.vcFiles as string[]).map((file) => {
            return JSON.parse(fs.readFileSync(file, 'utf-8')) as VerifiableCredential
          })
        : []

      const agentVCs: VerifiableCredential[] = []

      const ids = cmd.vcIds ? (cmd.vcIds as string[]) : []
      for (const hash of ids) {
        agentVCs.push(await agent.dataStoreGetVerifiableCredential({ hash }))
      }

      const verifiableCredentials = fileVCs.concat(agentVCs)
      if (verifiableCredentials.length === 0) {
        throw Error('No verifiable credentials were found matching the critery. Did you use the --vc-files and/or --vc-ids options?')
      }

      const did = await asDID(cmd.did)
      const id = await agent.didManagerGet({ did })
      const didDoc = await exportToDIDDocument(id)
      const url = `https://${convertDidWebToHost(did)}`
      nock.cleanAll()
      nock(url)
        .get(`/.well-known/did.json`)
        .times(10)
        .reply(200, {
          ...didDoc,
        })

      const uniqueVP = await agent.issueVerifiablePresentation({
        challenge: cmd.challenge as string,
        verifiableCredentials,
        domain: cmd.targetDomain,
        persist: cmd.persist === true,
      })

      const vp = uniqueVP.verifiablePresentation
      printTable([
        {
          types: vp.type?.toString(),
          holder: vp.holder,
          'issuance-date': vp.proof.created,
          id: uniqueVP.hash,
          persisted: cmd.persist === true,
        },
      ])
      if (cmd.show) {
        console.log(JSON.stringify(vp, null, 2))
      }
    } catch (e: any) {
      console.error(e.message)
    } finally {
      nock.cleanAll()
    }
  })

vp.command('export')
  .description('Exports a Verifiable Presentation to disk')
  .argument('<id>', 'The id of the VerifiablePresentation that you want to export')
  .option('-d, --did <string>', 'the DID or domain which will be used')
  .option('-p, --path <string>', 'A base path to export the files to. Defaults to "exported"')
  .option('--show', 'Print the Verifiable Presentation to console')
  .action(async (id, cmd) => {
    const agent = await getAgent()
    const exportResult = await agent.exportVCsToPath({
      domain: cmd.did,
      hash: id,
      includeVPs: true,
      includeVCs: false,
      exportPath: cmd.path,
    })
    printTable(exportResult)
    console.log(`Verifiable Presentation file has been written to the above path`)
  })
