import { getAgent } from './setup'
import { program } from 'commander'
import { printTable } from 'console-table-printer'
import fs from 'fs'
import { privateKeyHexFromPEM, X509Opts } from '@sphereon/ssi-sdk-bls-kms-local'

const did = program.command('did').description('Decentralized identifiers')

did
  .command('create')
  .description('creates a did:web with the received arguments')
  .option('-pkf, --private-key-file <string>', 'Private Key file')
  .option('-cf, --cert-file <string>', 'Certificate file')
  .option('-cac, --ca-chain <string>', 'the Certificate Chain input')
  .option('-d, --domain <string>', 'the domain of the did')
  .action(async (cmd) => {
    const privateKeyPEM = fs.readFileSync(cmd['private-key-file'], 'utf-8')
    const certificatePEM = fs.readFileSync(cmd['cert-file'], 'utf-8')
    const certificateChainPEM = fs.readFileSync(cmd['ca-chain'], 'utf-8')
    const cn = cmd.domain
    const path = cmd['ca-chain'].split('/')
    const certificateChainURL = `https://${cn}/.wellknown/${path[path.length - 1]}`
    const agent = getAgent(program.opts().config)

  try {

    const x509: X509Opts = {
      cn,
      certificatePEM,
      certificateChainPEM,
      privateKeyPEM,
      certificateChainURL
    }
    const privateKeyHex = privateKeyHexFromPEM(privateKeyPEM)
    const meta = { x509 }

    await agent.keyManagerImport({ kid: cn, privateKeyHex, type: 'RSA', meta})

    const identifier = await agent.didManagerCreate({ provider: 'did:web',  alias: `did:web${cn}`})
    printTable([{ provider: identifier.provider, alias: identifier.alias, did: identifier.did }])
  } catch (e: any) {
    console.error(e.message)
  }
})
