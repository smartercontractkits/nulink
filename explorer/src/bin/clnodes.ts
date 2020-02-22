import yargs from 'yargs'
import { add, remove } from '../cli/clnodes'

yargs
  .usage('Usage: $0 <command> [options]')
  .command({
    command: 'add <name> [url]',
    aliases: 'create',
    describe: 'Add a nulink node',
    builder: (yargs): any => {
      yargs
        .positional('name', {
          describe: 'The name of the NuLink Node to create',
          type: 'string',
        })
        .describe('u', 'The URL of the NuLink Node to create')
        .alias('u', 'url')
        .nargs('u', 1)
    },
    handler: argv => add(argv.name as string, argv.url as string),
  })
  .command({
    command: 'delete <name>',
    aliases: 'rm',
    describe: 'Remove a nulink node',
    builder: (yargs): any => {
      yargs.positional('name', {
        describe: 'The name of the NuLink Node to remove',
        type: 'string',
      })
    },
    handler: argv => remove(argv.name as string),
  })
  .help('h')
  .alias('h', 'help')
  .demandCommand(1).argv
