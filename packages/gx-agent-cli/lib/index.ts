import { program } from 'commander'
import inquirer from 'inquirer'

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

import './config'
import './did'
import './participant'
import './ecosystem'
import './vc'
import './vp'

if (!process.argv.slice(2).length) {
  program.outputHelp()
} else {
  program.parse(process.argv)
}
