#!/usr/bin/env node
var lib = require('../index.js')

const {
  debug,
  fullChangelog,
  lernaChangelog,
  recentChangelog,
  unreleasedChangelog,
} = lib

var flags = require('yargs')
  .version(require('../package').version)
  .usage('\nUsage: $0 [options]')
  .option('all', {
    description: 'start tag',
  })
  .option('squash', {
    description: 'squash preleases',
    default: true,
  })
  .option('unreleased', {
    description: 'last prelease and unreleased',
    default: false,
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
  fullChangelog(flags.squash).then(debug)
} else if (flags.unreleased) {
  unreleasedChangelog().then(debug)
} else if ((flags.from && flags.to) || flags.from) {
  lernaChangelog({ version: flags.from }, { version: flags.to }).then(debug)
} else {
  recentChangelog().then(debug)
}
