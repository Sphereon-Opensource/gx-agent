import { getAgent } from './setup'
import { program } from 'commander'
import { printTable } from 'console-table-printer'
import fs from 'fs'
import { IIdentifier } from '@veramo/core'

const did = program.command('did').description('gx-participant Decentralized identifiers')

did
  .command('create')
  .description('creates a did:web from X509 Certificates provided using files')
  .requiredOption('-private-key-file, --private-key-file <string>', 'Private Key file')
  .requiredOption('-cert-file, --cert-file <string>', 'Certificate file')
  .requiredOption('-ca-chain-file, --ca-chain-file <string>', 'the Certificate Chain file')
  .requiredOption('-domain, --domain <string>', 'the domain of certificate (CN), which will be used in the DID')
  .action(async (cmd) => {
    const privateKeyPEM = fs.readFileSync(cmd['private-key-file'], 'utf-8')
    const certificatePEM = fs.readFileSync(cmd['cert-file'], 'utf-8')
    const certificateChainPEM = fs.readFileSync(cmd['ca-chain-file'], 'utf-8')
    const cn = cmd.domain
    const path = cmd['ca-chain-file'].split('/')
    const certificateChainURL = `https://${cn}/.wellknown/${path[path.length - 1]}`
    const agent = getAgent(program.opts().config)
    try {
      const identifier: IIdentifier = await agent.createDIDFromX509({
        domain: cmd.domain,
        privateKeyPEM,
        certificatePEM,
        certificateChainPEM,
        certificateChainURL,
        kms: 'local',
      })
      printTable([{ provider: identifier.provider, alias: identifier.alias, did: identifier.did }])
    } catch (e: any) {
      console.error(e.message)
    }
  })
