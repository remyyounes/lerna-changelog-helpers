#!/usr/bin/env node
var foo = require('../index.js')
const {
  debug,
  fullChangelog,
  lernaChangelog,
  recentChangelog
} = foo

var flags = require('yargs')
  .version(require('../package').version)
  .usage('\nUsage: $0 [options]')
  .option('all', {
    description: 'start tag',
  })
  .option('from', {
    description: 'start tag',
  })
  .option('to', {
    description: 'end tag',
  })
  .help('help')
  .showHelpOnFail(true, 'use --help for available options').argv


if (flags.all) {
  fullChangelog().then(debug)
} else if ((flags.from && flags.to) || flags.from) {
  lernaChangelog(flags.from, flags.to).then(debug)
} else {
  recentChangelog().then(debug)
}
