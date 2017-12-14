const { exec } = require('child_process')
const argv = require('yargs').argv

const toArray = str => str.split('\n')

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
      `npx lerna-changelog ${tagFrom(from)} ${tagTo(to)}`,
      (err, stdout, stderr) => (err ? reject(err) : resolve(stdout))
    )
  )

export const fullChangelog = () => {
  getTags()
    .then(tags => lernaChangelog(tags.pop()))
    .then(changelog => {
      console.log(changelog)
    })
}

const recentTagChangelog = () => {
  getTags()
    .then(tags => lernaChangelog(tags[0], tags[0]))
    .then(changelog => {
      console.log(changelog)
    })

  // getTags.then(tags => lernaChangelog(tags[1], tags[0])).then(changelog => {
  //   console.log(changelog)
  // })
}

// fullChangelog()
recentTagChangelog()

if (argv['to']) {
}
