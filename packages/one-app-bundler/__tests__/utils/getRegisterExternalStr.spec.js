const getRegisterExternalStr = require('../../utils/getRegisterExternalStr')

describe('getRegisterExternalStr', () => {
  it('outputs the register external function call as string', () => {
    expect(getRegisterExternalStr(`my-external`, `1.2.3`)).toBe("Holocron.registerExternal({ name: \"my-external\", version: \"1.2.3\", module: __holocron_external__my_external__1_2_3});")
  })
})