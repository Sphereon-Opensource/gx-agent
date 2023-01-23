import { program } from 'commander'
import inquirer from 'inquirer'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

import './config'
import './did'
import './vc'
import './vp'
import './ecosystem'
import './participant'
import './service-offering'

if (!process.argv.slice(2).length) {
  program.outputHelp()
} else {
  program.parse(process.argv)
}