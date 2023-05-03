const getExternalFilename = require('../../utils/getExternalFilename')

describe('getExternalFilename', () => {
  it('outputs the external filename', () => {
    expect(getExternalFilename(`my-external`)).toBe(`my-external.js`)
  })
})