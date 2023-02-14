import { program } from 'commander'
import inquirer from 'inquirer'

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import inquirerAutoPrompt from 'inquirer-autocomplete-prompt'
inquirer.registerPrompt('autocomplete', inquirerAutoPrompt)

import './config.js'
import './did.js'
import './vc.js'
import './vp.js'
import './ecosystem.js'
import './participant.js'
import './service-offering.js'

if (!process.argv.slice(2).length) {
  program.outputHelp()
} else {
  program.parse(process.argv)
}
