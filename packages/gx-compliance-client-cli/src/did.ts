import { getAgent } from './setup'
import { program } from 'commander'
import { printTable } from 'console-table-printer'
import fs from 'fs'
import { privateKeyHexFromPEM } from '@sphereon/ssi-sdk-did-utils'

const did = program.command('did').description('gx-participant Decentralized identifiers')

did
  .command('create')
  .description('creates a did:web from X509 Certificates provided using files')
  .requiredOption('-pkf, --private-key-file <string>', 'Private Key file')
  .requiredOption('-cf, --cert-file <string>', 'Certificate file')
  .requiredOption('-cacf, --ca-chain-file <string>', 'the Certificate Chain file')
  .requiredOption('-d, --domain <string>', 'the domain of certificate (CN), which will be used in the DID')
  .action(async (cmd) => {
    const privateKeyPEM = fs.readFileSync(cmd['private-key-file'], 'utf-8')
    const certificatePEM = fs.readFileSync(cmd['cert-file'], 'utf-8')
    const certificateChainPEM = fs.readFileSync(cmd['ca-chain-file'], 'utf-8')
    const cn = cmd.domain
    const path = cmd['ca-chain-file'].split('/')
    const certificateChainURL = `https://${cn}/.wellknown/${path[path.length - 1]}`
    const agent = getAgent(program.opts().config)

    // TODO: The code below till the printTable, should move to gx-compliance-cli for reuse in non CLI envs
    try {
      const x509 = {
        cn,
        certificatePEM,
        certificateChainPEM,
        privateKeyPEM,
        certificateChainURL,
      }
      const privateKeyHex = privateKeyHexFromPEM(privateKeyPEM)
      const meta = { x509 }

      await agent.keyManagerImport({ kid: cn, privateKeyHex, type: 'RSA', meta, kms: 'local' })
      const identifier = await agent.didManagerCreate({ provider: 'did:web', alias: `did:web:${cn}` })
      printTable([{ provider: identifier.provider, alias: identifier.alias, did: identifier.did }])
    } catch (e: any) {
      console.error(e.message)
    }
  })
