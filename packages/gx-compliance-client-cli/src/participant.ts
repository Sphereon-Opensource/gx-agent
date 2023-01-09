import {program} from "commander";

const participant = program.command('participant').description('Gaia-X participant')

participant
  .command("compliance").description("Compliance of the participant")
  .command("status").description("Compliance status").option('–sd-id=<abcd>', "Self-Description id")
  .action(async (cmd) => {

  })
