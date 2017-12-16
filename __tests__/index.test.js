const R = require("ramda");

const {
  prepend,
  removeBlanks,
  isReleased,
  tagFrom,
  tagTo,
  parseTagVersion,
  buildTimestampHash,
  getPrevStableTag,
  removePrereleases,
  sortTags,
  squashVersions,
  toTag,
  getTags,
  parseTags,
  lernaChangelog,
  fullChangelog,
  recentChangelog
} = require("../index");

const versions = {
  "v3.0.0": 3,
  "v2.0.0": 2,
  "v2.0.0-rc.0": 1,
  "v1.0.0": 0
};

test("prepend adds a string to the beginning of another string", () => {
  expect(prepend("foo")("bar")).toEqual("foobar");
});

test("remove blanks filters out falsey values", () => {
  const arr = ["foo", "", "bar", false, null, undefined];
  expect(removeBlanks(arr)).toEqual(["foo", "bar"]);
});

test('isReleased returns true unless string begins with "Unreleased"', () => {
  expect(isReleased("Unreleased string here")).toEqual(false);
  expect(isReleased("String here")).toEqual(true);
});

test("tagFrom returns the lerna-changelog --tag-from option", () => {
  expect(tagFrom(null)).toEqual("");
  expect(tagFrom({ version: "v1.0.0" })).toEqual("--tag-from v1.0.0");
});

test("tagTo returns the lerna-changelog --tag-to option", () => {
  expect(tagTo(null)).toEqual("");
  expect(tagTo({ version: "v1.0.0" })).toEqual("--tag-to v1.0.0");
});

test("parseTagVersion extracts the version from a string", () => {
  expect(parseTagVersion("v1.0.0 (12-12-2017)")).toEqual("v1.0.0");
  expect(parseTagVersion("v1.0.0-rc.0 (12-12-2017)")).toEqual("v1.0.0");
});

test("buildTimestampHash converts tags to a hash of version:timestamp", () => {
  const tags = [
    { version: "v3.0.0", date: 3 },
    { version: "v2.0.0", date: 2 },
    { version: "v2.0.0-rc.0", date: 1 },
    { version: "v1.0.0", date: 0 }
  ];
  expect(buildTimestampHash(tags)).toEqual(versions);
});

test("getPrevStableTag skips preleases to get the last stable tag", () => {
  const tags = [
    { version: "v2.0.0", date: 2 },
    { version: "v2.0.0-rc.0", date: 1 },
    { version: "v1.0.0", date: 0 }
  ];
  expect(getPrevStableTag(R.head(tags).version, tags)).toEqual({
    version: "v1.0.0",
    date: 0
  });
});

test("removePrereleases filters out non stable versions", () => {
  const filtered = ["v2.0.0", "v1.0.0"];
  const tagsArr = ["v2.0.0", "v2.0.0-rc.0", "v1.0.0"];
  expect(removePrereleases(tagsArr.map(parseTagVersion))).toEqual(filtered);
});

test("sortTags sorts the tag in descending order", () => {
  const tagsArr = ["v3.0.0", "v2.0.0", "v2.0.0-rc.0", "v1.0.0"];
  const sorted = ["v3.0.0", "v2.0.0", "v2.0.0-rc.0", "v1.0.0"];

  expect(sortTags(versions)(tagsArr)).toEqual(sorted);
});

test("toTag parses a string into a [name: date ] hash", () => {
  const str = "v3.0.0|1";
  const tag = { date: 1, version: "v3.0.0" };
  expect(toTag(str)).toEqual(tag);
});

test("parseTags git-cli output in to a tag array", () => {
  const gitOutput = `
    v2.0.0|3
    v2.0.0-rc.0|2
    v1.0.0|1
  `;
  const tags = [
    { date: 3, version: "v2.0.0" },
    { date: 2, version: "v2.0.0-rc.0" },
    { date: 1, version: "v1.0.0" }
  ];
  expect(parseTags(gitOutput)).toEqual(tags);
});

test("squashVersions", () => {
  const changelog = `
  ## v3.0.0 (2017-12-12)
  ## v2.0.0 (2017-01-12)
  `;

  const expected = `

  `;
  expect(squashVersions(changelog)).toEqual(expected);
});

// squashVersions,
