const { exec } = require('child_process')
const R = require('ramda')

const TAG_SPLIT = '\n## '

const debug = x => {
  console.log(x)
  debugger
  return x
}

const toArray = str => str.split('\n')

const prepend = pre => str => pre.concat(str)

const removeBlanks = arr => R.filter(R.identity)(arr)

const isUnreleased = tag => R.startsWith('Unreleased')

const tagFrom = tag => (tag ? `--tag-from ${tag.version}` : '')

const tagTo = tag => (tag ? `--tag-to ${tag.version}` : '')

const parseTagVersion = tag =>
  R.pipe(R.split(' '), R.head, R.split('-'), R.head, R.trim)(tag)

const getPrevStableTag = tags => {
  const latest = R.head(tags).version
  return R.head(tags.filter(tag => !tag.version.includes(latest)))
}

const filterTags = tags => {
  let version = null
  return tags.filter(body => {
    const curVersion = parseTagVersion(body)
    if (isUnreleased(body) || curVersion.includes(version)) {
      return false
    }
    version = curVersion
    return true
  })
}

const sortTags = tags => mdTags =>
  mdTags.sort((a, b) => {
    const dateA = tags[a] && tags[a].date
    const dateB = tags[b] && tags[b].date

    return dateA - dateB
  })

const squashVersions = versions =>
  R.pipe(
    R.split(TAG_SPLIT),
    removeBlanks,
    filterTags,
    sortTags(versions),
    R.join(TAG_SPLIT),
    prepend(TAG_SPLIT)
  )

const toTag = meta => {
  const [version, date] = meta.split('|')
  return { version, date: parseInt(date, 10) }
}

const getTags = () =>
  new Promise((resolve, reject) =>
    exec(
      "git for-each-ref --sort=-taggerdate --format '%(tag)|%(taggerdate:raw)' refs/tags",
      (err, stdout, stderr) => (err ? reject(err) : resolve(stdout))
    )
  )
    .then(toArray)
    .then(removeBlanks)
    .then(R.map(toTag))

const lernaChangelog = (from, to) =>
  new Promise((resolve, reject) =>
    exec(
      `npx lerna-changelog ${tagFrom(from)} ${tagTo(to)}`,
      (err, stdout, stderr) => (err ? reject(err) : resolve(stdout))
    )
  )

const fullChangelog = () =>
  getTags().then(tags =>
    lernaChangelog(R.last(tags)).then(squashVersions(tags))
  )

const recentChangelog = () =>
  getTags().then(tags =>
    lernaChangelog(getPrevStableTag(tags), R.head(tags)).then(
      squashVersions(tags)
    )
  )

module.exports = {
  debug,
  fullChangelog,
  lernaChangelog,
  recentChangelog,
}
