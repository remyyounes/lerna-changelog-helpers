const { exec } = require("child_process");
const { split, head, last, join, compose, map, filter } = require("ramda");

const TAG_SPLIT = "\n## ";

const toArray = str => str.split("\n");
const prepend = pre => str => pre.concat(str);

const debug = x => {
  console.log(x);
  debugger;
  return x;
};

const removeBlanks = arr => arr.filter(str => str);

const isUnreleased = tag => tag.indexOf("Unreleased") === 0;

const tagFrom = from => (from ? `--tag-from ${from}` : "");

const tagTo = to => (to ? `--tag-to ${to}` : "");

const parseTagVersion = tag =>
  tag
    .split(" ")[0]
    .split("-")[0]
    .trim();

const getPrevStableTag = tags => {
  const latest = head(tags).version;
  return head(tags.filter(tag => !tag.version.includes(latest)));
};

const filterTags = tags => {
  let version = null;
  return tags.filter(body => {
    const curVersion = parseTagVersion(body);
    if (isUnreleased(body) || curVersion.includes(version)) {
      return false;
    }
    version = curVersion;
    return true;
  });
};

const sortTags = versions => tags =>
  tags.sort((a, b) => {
    const dateA = versions[a] && versions[a].date;
    const dateB = versions[b] && versions[b].date;
    return dateA - dateB;
  });

const squashVersions = versions =>
  compose(
    prepend(TAG_SPLIT),
    join(TAG_SPLIT),
    sortTags(versions),
    filterTags,
    removeBlanks,
    split(TAG_SPLIT)
  );

const toTag = meta => {
  const [version, date] = meta.split("|");
  return { version, date: parseInt(date, 10) };
};

const getTags = () =>
  new Promise((resolve, reject) =>
    exec(
      "git for-each-ref --sort=-taggerdate --format '%(tag)|%(taggerdate:raw)' refs/tags",
      (err, stdout, stderr) => (err ? reject(err) : resolve(stdout))
    )
  )
    .then(toArray)
    .then(removeBlanks)
    .then(map(toTag));

const lernaChangelog = (from = {}, to = {}) =>
  new Promise((resolve, reject) =>
    exec(
      `npx lerna-changelog ${tagFrom(from.version)} ${tagTo(to.version)}`,
      (err, stdout, stderr) => (err ? reject(err) : resolve(stdout))
    )
  );

const fullChangelog = () =>
  getTags().then(tags => lernaChangelog(last(tags)).then(squashVersions(tags)));

const recentChangelog = () =>
  getTags().then(tags =>
    lernaChangelog(getPrevStableTag(tags), head(tags)).then(
      squashVersions(tags)
    )
  );

module.exports = {
  debug,
  fullChangelog,
  lernaChangelog,
  recentChangelog
};
