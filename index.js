const { exec } = require('child_process')

const toArray = str => str.split('\n')
const debug = x => {
  console.log(x)
  return x;
}
const removeBlanks = arr => arr.filter(str => str)

const tagFrom = from => (from ? `--tag-from ${from}` : '')

const tagTo = to => (to ? `--tag-to ${to}` : '')

const getTags = () =>
  new Promise((resolve, reject) =>
    exec(
      "git for-each-ref --sort=-taggerdate --format '%(tag)' refs/tags",
      (err, stdout, stderr) => (err ? reject(err) : resolve(stdout))
    )
  )
    .then(toArray)
    .then(removeBlanks)

const lernaChangelog = (from, to) =>
  new Promise((resolve, reject) =>
    exec(
      debug(`npx lerna-changelog ${tagFrom(from)} ${tagTo(to)}`),
      (err, stdout, stderr) => (err ? reject(err) : resolve(stdout))
    )
  )

const rangeChangelog = lernaChangelog

const fullChangelog = () => getTags()
    .then(tags => lernaChangelog(tags.pop()))


const recentChangelog = () => getTags()
    .then(tags => lernaChangelog(tags[1], tags[0]))


module.exports = {
  debug,
  fullChangelog,
  lernaChangelog
  recentChangelog,
}
