const { sortTags } = require('../index')
const versions = {
  'v2.0.0': 3,
  'v2.0.0-rc.0': 2,
  'v1.0.0': 1,
}

test('sorts tags by date', () => {
  const tags = ['v1.0.0', 'v2.0.0', 'v2.0.0-rc.0']
  const sorted = ['v2.0.0', 'v2.0.0-rc.0', 'v1.0.0']
  expect(sortTags(versions)(tags)).toEqual(sorted)
})
