#!/usr/bin/env node

const { fullChangelog } = require('../index.js')

require('yargs')
  .version(require('../package').version)
  .usage('\nUsage: $0 [options]')
  .option('from', {
    description: 'start tag',
  })
  .option('to', {
    description: 'end tag',
  })
  .help('help')
  .showHelpOnFail(true, 'use --help for available options').argv
