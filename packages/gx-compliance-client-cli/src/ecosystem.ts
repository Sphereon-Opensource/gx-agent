import {program} from "commander";

const ecosystem = program.command('ecosystem').description('gx client ecosystem')

ecosystem
.command('add')
.description('creates a did:web with the received arguments')
