import { program } from 'commander'
import inquirer from 'inquirer'

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

import './did'
import './participant'
import './ecosystem'
import './vc'

if (!process.argv.slice(2).length) {
  program.outputHelp()
} else {
  program.parse(process.argv)
}
