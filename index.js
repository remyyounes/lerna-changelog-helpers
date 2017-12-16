const { exec } = require("child_process");
const R = require("ramda");

const TAG_SPLIT = "\n## ";

const debug = x => {
  console.log(x);
  debugger;
  return x;
};

const prepend = pre => str => `${pre}${str}`;

const removeBlanks = R.filter(R.identity);

const isReleased = R.pipe(R.startsWith("Unreleased"), R.not);

const tagFrom = tag => (tag ? `--tag-from ${tag.version}` : "");

const tagTo = tag => (tag ? `--tag-to ${tag.version}` : "");

const parseTagVersion = R.pipe(
  R.split(" "),
  R.head,
  R.split("-"),
  R.head,
  R.trim
);

const buildTimestampHash = R.reduce((acc, tag) => {
  acc[tag.version] = tag.date;
  return acc;
}, {});

const getPrevStableTag = latest =>
  R.compose(R.head, R.filter(tag => !tag.version.includes(latest)));

const getLatestTag = R.pipe(
  R.split(TAG_SPLIT),
  removeBlanks,
  R.head,
  prepend(TAG_SPLIT)
);

const removePrereleases = tags => {
  const versions = {};

  return tags.reduce((acc, tag) => {
    const version = parseTagVersion(tag);

    if (!versions[version]) {
      versions[version] = true;
      acc.push(tag);
    }

    return acc;
  }, []);
};

const sortTags = timestampHash => mdTags =>
  mdTags.sort((a, b) => {
    const versionA = parseTagVersion(a);
    const versionB = parseTagVersion(b);

    return timestampHash[versionB] - timestampHash[versionA];
  });

const squashVersions = tags =>
  R.pipe(
    R.split(TAG_SPLIT),
    removeBlanks,
    R.filter(isReleased),
    removePrereleases,
    sortTags(buildTimestampHash(tags)),
    R.join(TAG_SPLIT),
    prepend(TAG_SPLIT)
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
  ).then(parseTags);

const parseTags = R.pipe(
  R.split("\n"),
  R.map(R.trim),
  removeBlanks,
  R.map(toTag)
);

const lernaChangelog = (from, to) =>
  new Promise((resolve, reject) =>
    exec(
      `npx lerna-changelog ${tagFrom(from)} ${tagTo(to)}`,
      (err, stdout, stderr) => (err ? reject(err) : resolve(stdout))
    )
  );

const fullChangelog = () =>
  getTags().then(tags =>
    lernaChangelog(R.last(tags)).then(squashVersions(tags))
  );

const recentChangelog = () =>
  getTags()
    .then(tags =>
      lernaChangelog(
        getPrevStableTag(R.head(tags).version, tags),
        R.head(tags)
      ).then(getLatestTag)
    )
    .catch(console.error);

module.exports = {
  buildTimestampHash,
  debug,
  fullChangelog,
  getLatestTag,
  getPrevStableTag,
  getTags,
  isReleased,
  lernaChangelog,
  parseTags,
  parseTagVersion,
  prepend,
  recentChangelog,
  removeBlanks,
  removePrereleases,
  sortTags,
  squashVersions,
  tagFrom,
  tagTo,
  toTag
};
