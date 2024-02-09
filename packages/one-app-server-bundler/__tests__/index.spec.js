const index = require('../index');

describe('index', () => {
  it('should export the META_DATA_KEY', () => {
    expect(index).toMatchInlineSnapshot(`
Object {
  "META_DATA_KEY": "__holocron_module_meta_data__",
}
`);
  });
});
