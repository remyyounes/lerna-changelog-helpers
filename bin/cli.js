#!/usr/bin/env node

const { fullChangelog } = require('../index.js')

require('yargs')
  .version(function() {
    return require('../package').version
  })
  .help('help')
  .option('from')
  .option('to')
  .showHelpOnFail(true, 'use --help for available options')
