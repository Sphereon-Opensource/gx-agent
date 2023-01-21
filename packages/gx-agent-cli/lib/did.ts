import { getAgent } from './setup'
import { program } from 'commander'
import { printTable } from 'console-table-printer'
import fs from 'fs'
import { DIDResolutionResult, IIdentifier } from '@veramo/core'
import { asDID, convertDidWebToHost } from '@sphereon/gx-agent'

const did = program.command('did').description('Decentralized Identifiers (DID) commands')

did
  .command('create')
  .description('creates a did:web from X509 Certificates provided using files')
  .requiredOption('--private-key-file <string>', 'Private Key file')
  .requiredOption('--cert-file <string>', 'Certificate file')
  .requiredOption('--ca-chain-file <string>', 'the Certificate Chain file')
  .requiredOption('-d, --domain <string>', 'the domain of certificate (CN), which will be used in the DID')
  .option('--ca-chain-url <string>', 'the Certificate Chain URL to use. A default location will be used if not supplied')
  .option(
    '-kid, --key-identifier <string>',
    'An optional key identifier name for the certificate and key. Will be stored in the DID Document. A default will be used if not supplied'
  )
  .action(async (cmd) => {
    const agent = await getAgent(program.opts().config)
    const privateKeyPEM = fs.readFileSync(cmd.privateKeyFile, 'utf-8')
    const certificatePEM = fs.readFileSync(cmd['certFile'], 'utf-8')
    const certificateChainPEM = fs.readFileSync(cmd['caChainFile'], 'utf-8')
    const did = asDID(cmd.domain)
    const cn = convertDidWebToHost(did)
    const x5cFile = cmd['caChainFile'].split('\\').pop().split('/').pop()
    const x5u = cmd['caChainUrl']
    if (x5u && x5u.startsWith('http://') && !x5u.startsWith('http://localhost')) {
      throw Error(`A CA chain needs to be hosted in a secure https:// location!. url supplied: ${x5u}`)
    }
    // fixme: this should be an optional param. If not supplied we can do it like this
    const certificateChainURL = x5u ? `https://${x5u.replace('https://', '')}` : `https://${cn}/.well-known/${x5cFile}`
    try {
      const identifier: IIdentifier = await agent.createDIDFromX509({
        domain: did,
        privateKeyPEM,
        certificatePEM,
        certificateChainPEM,
        certificateChainURL,
        // kms: 'local'
        kid: cmd.keyIdentifier ? cmd.keyIdentifier : 'JWK2020-RSA',
      })
      printTable([{ provider: identifier.provider, DID: identifier.did, alias: identifier.alias }])
    } catch (e: any) {
      console.error(e.message)
    }
  })

did
  .command('list')
  .description('lists identifiers stored in the agent')
  .action(async (cmd) => {
    const agent = await getAgent(program.opts().config)
    try {
      const identifiers: IIdentifier[] = await agent.didManagerFind({ provider: 'did:web' })
      if (!identifiers || identifiers.length === 0) {
        console.log('No identifiers stored in the agent!')
      } else {
        printTable(
          identifiers.map((id) => {
            return {
              provider: id.provider,
              DID: id.did,
              alias: id.alias,
            }
          })
        )
      }
    } catch (e: any) {
      console.error(e.message)
    }
  })

did
  .command('resolve')
  .description('resolves a did:web')
  .requiredOption('-d, --did <string>', 'the DID or domain associated with the DID web')
  .option('-l, --local-only', 'Only resolves agent stored DIDs. Does not call externally hosted DIDs')
  .action(async (cmd) => {
    const did = asDID(cmd.did)
    const agent = await getAgent(program.opts().config)
    try {
      printTable([{ DID: did }])
      if (cmd.localOnly) {
        console.log('DID Document:\n' + JSON.stringify(await agent.exportDIDDocument({ domain: did }), null, 2))
        return
      }

      const result: DIDResolutionResult = await agent.resolveDid({ didUrl: did })
      if (result.didDocument) {
        console.log(JSON.stringify(result.didDocument, null, 2))
      } else if (result.didResolutionMetadata) {
        console.log(printTable([{ ...result.didResolutionMetadata }]))
      } else {
        console.log(`Unknown error occurred resolving DID ${did}`)
      }
    } catch (e: any) {
      console.error(e.message)
    }
  })

did
  .command('export')
  .description(
    "export a DID and it's CA-chain to a well-known location, for hosting. Be aware that this will create a .well-known path, which is invisible in most Operating Systems"
  )
  .requiredOption('-d, --did <string>', 'the domain of certificate (CN) or did')
  .option('-p, --path <string>', 'A base path to export the files to. Defaults to "exported"')
  .action(async (cmd) => {
    const agent = await getAgent(program.opts().config)
    const path = cmd.path ? cmd.path : 'exported'
    const did = asDID(cmd.did)
    try {
      const exportResult = await agent.exportDIDToPath({ domain: did, path })
      if (!exportResult || exportResult.length === 0) {
        console.log(`Nothing exported for ${did}`)
      } else {
        printTable(
          exportResult.map((result) => {
            return { DID: did, ...result }
          })
        )
        console.log('Well-known DID files have been exported.')
        console.log(
          `Please copy everything from ${path}/${convertDidWebToHost(
            did
          )}, to your webserver. Do not forget to include the hidden .well-known directory!`
        )
      }
    } catch (e: any) {
      console.error(e.message)
    }
  })
