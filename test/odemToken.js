const { should } = require('./helpers/utils')
const ODEMToken = artifacts.require('./ODEMToken.sol')

contract('ODEMToken', () => {
  let token

  beforeEach(async () => {
    token = await ODEMToken.deployed()
  })

  it('has a name', async () => {
    const name = await token.name()
    name.should.be.equal("ODEM Token")
  })

  it('possesses a symbol', async () => {
    const symbol = await token.symbol()
    symbol.should.be.equal("ODEM")
  })

  it('contains 18 decimals', async () => {
    const decimals = await token.decimals()
    decimals.should.be.bignumber.equal(18)
  })
})
