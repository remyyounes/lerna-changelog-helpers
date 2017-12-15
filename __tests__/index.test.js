const { sortTags } = require("../index");
const versions = [
  { version: "v1.0.0", date: 1 },
  { version: "v2.0.0", date: 3 },
  { version: "v2.0.0-rc.0", date: 0 }
];

test("sorts tags by date", () => {
  const tags = ["v1.0.0", "v2.0.0", "v2.0.0-rc.0"];
  const sorted = ["v1.0.0", "v2.0.0-rc.0", "v2.0.0"];
  expect(sortTags(versions)(tags)).toEqual(sorted);
});
