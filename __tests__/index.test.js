const R = require("ramda");

const {
  prepend,
  removeBlanks,
  isUnreleased,
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

test('isUnreleased returns true if string begins with "Unreleased"', () => {
  expect(isUnreleased("Unreleased string here")).toEqual(true);
  expect(isUnreleased("String here")).toEqual(false);
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
