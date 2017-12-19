const R = require('ramda')

const {
  buildTimestampHash,
  fullChangelog,
  getLatestTag,
  getPrevStableTag,
  getTags,
  isPrerelease,
  isReleased,
  isUnreleased,
  lernaChangelog,
  parseTags,
  parseTagVersion,
  parseStableTagVersion,
  prepend,
  recentChangelog,
  removeBlanks,
  removePrereleases,
  sortTags,
  squashUnreleased,
  squashVersions,
  tagFrom,
  tagTo,
  toTag,
} = require('../index')

const versions = {
  'v3.0.0': 3,
  'v2.0.0': 2,
  'v2.0.0-rc.0': 1,
  'v1.0.0': 0,
}

test('prepend adds a string to the beginning of another string', () => {
  expect(prepend('foo')('bar')).toEqual('foobar')
})

test('remove blanks filters out falsey values', () => {
  const arr = ['foo', '', 'bar', false, null, undefined]
  expect(removeBlanks(arr)).toEqual(['foo', 'bar'])
})

test('isPrerelease returns true if "Unreleased" or prelease', () => {
  expect(isPrerelease('Unreleased')).toEqual(true)
  expect(isPrerelease('v3.0.0-rc.0')).toContain('v3.0.0-')
  expect(isPrerelease('v3.0.0')).toEqual(null)
})

test('isReleased returns true if string does not begin with "Unreleased"', () => {
  expect(isReleased('Unreleased string here')).toEqual(false)
  expect(isReleased('String here')).toEqual(true)
})

test('isUnreleased returns true if string begins with "Unreleased"', () => {
  expect(isUnreleased('Unreleased string here')).toEqual(true)
  expect(isUnreleased('String here')).toEqual(false)
})

test('tagFrom returns the lerna-changelog --tag-from option', () => {
  expect(tagFrom(null)).toEqual('')
  expect(tagFrom({ version: 'v1.0.0' })).toEqual('--tag-from v1.0.0')
})

test('tagTo returns the lerna-changelog --tag-to option', () => {
  expect(tagTo(null)).toEqual('')
  expect(tagTo({ version: 'v1.0.0' })).toEqual('--tag-to v1.0.0')
})

test('parseTagVersion extracts the version from a string', () => {
  expect(parseTagVersion('v1.0.0 (12-12-2017)')).toEqual('v1.0.0')
  expect(parseTagVersion('v1.0.0-rc.0 (12-12-2017)')).toEqual('v1.0.0-rc.0')
})

test('parseStableTagVersion extracts the version from a string', () => {
  expect(parseStableTagVersion('v1.0.0 (12-12-2017)')).toEqual('v1.0.0')
  expect(parseStableTagVersion('v1.0.0-rc.0 (12-12-2017)')).toEqual('v1.0.0')
})

test('buildTimestampHash converts tags to a hash of version:timestamp', () => {
  const tags = [
    { version: 'v3.0.0', date: 3 },
    { version: 'v2.0.0', date: 2 },
    { version: 'v2.0.0-rc.0', date: 1 },
    { version: 'v1.0.0', date: 0 },
  ]
  expect(buildTimestampHash(tags)).toEqual(versions)
})

test('getPrevStableTag skips preleases to get the last stable tag', () => {
  const tags = [
    { version: 'v2.0.0', date: 2 },
    { version: 'v2.0.0-rc.0', date: 1 },
    { version: 'v1.0.0', date: 0 },
  ]
  expect(getPrevStableTag(R.head(tags).version)(tags)).toEqual({
    version: 'v1.0.0',
    date: 0,
  })
})

test('removePrereleases filters out non stable versions', () => {
  const filtered = ['v2.0.0', 'v1.0.0']
  const tagsArr = ['v2.0.0', 'v2.0.0-rc.0', 'v1.0.0']
  expect(removePrereleases(tagsArr.map(parseTagVersion))).toEqual(filtered)
})

test('sortTags sorts the tag in descending order', () => {
  const tagsArr = ['v3.0.0', 'v2.0.0', 'v2.0.0-rc.0', 'v1.0.0']
  const sorted = ['v3.0.0', 'v2.0.0', 'v2.0.0-rc.0', 'v1.0.0']

  expect(sortTags(versions)(tagsArr)).toEqual(sorted)
})

test('toTag parses a string into a [name: date ] hash', () => {
  const str = 'v3.0.0|1'
  const tag = { date: 1, version: 'v3.0.0' }
  expect(toTag(str)).toEqual(tag)
})

test('parseTags git-cli output in to a tag array', () => {
  const gitOutput = `
    v2.0.0|3
    v2.0.0-rc.0|2
    v1.0.0|1
  `
  const tags = [
    { date: 3, version: 'v2.0.0' },
    { date: 2, version: 'v2.0.0-rc.0' },
    { date: 1, version: 'v1.0.0' },
  ]
  expect(parseTags(gitOutput)).toEqual(tags)
})

test('squashVersions', () => {
  const changelog = `
## Unreleased
## v4.0.0-rc.1 (2017-12-12)
## v4.0.0-rc.0 (2017-12-12)
## v3.0.0 (2017-12-12)
## v3.0.0-rc.0 (2017-12-12)
## v2.0.0 (2017-01-12)
## v2.0.0-rc.0 (2017-12-12)
## v1.0.0 (2017-12-12)
  `

  const expected = `
## v4.0.0-rc.1 (2017-12-12)
## v3.0.0 (2017-12-12)
## v2.0.0 (2017-01-12)
## v1.0.0 (2017-12-12)
  `

  const tags = [
    { date: 5, version: 'v3.0.0' },
    { date: 4, version: 'v3.0.0-rc.0' },
    { date: 3, version: 'v2.0.0' },
    { date: 2, version: 'v2.0.0-rc.0' },
    { date: 1, version: 'v1.0.0' },
  ]

  expect(squashVersions(tags)(changelog)).toEqual(expected)
})

test('squashUnreleased', () => {
  const changelog = `
## Unreleased
## v3.0.0 (2017-12-12)
  `

  const expected = `
## Unreleased`

  const changelogPrelease = `
## Unreleased
## v3.0.0-rc.1 (2017-12-12)
  `

  const expectedPrelease = `
## Unreleased
## v3.0.0-rc.1 (2017-12-12)
  `
  expect(squashUnreleased(changelog)).toEqual(expected)
  expect(squashUnreleased(changelogPrelease)).toEqual(expectedPrelease)
})
