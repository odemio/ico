const { should, ensuresException } = require('./helpers/utils')
const BurnableTokenMock = artifacts.require('./BurnableTokenMock.sol')

const BigNumber = web3.BigNumber

contract('BurnableToken', function (accounts) {
  let token
  let expectedTokenSupply = new BigNumber(900)

  beforeEach(async function () {
    token = await BurnableTokenMock.new(accounts[1], 1000)
  })

  it('owner should be able to burn tokens', async function () {
    const { logs } = await token.burn(100, { from: accounts[1] })

    const balance = await token.balanceOf(accounts[1])
    balance.should.be.bignumber.equal(expectedTokenSupply)

    const totalSupply = await token.totalSupply()
    totalSupply.should.be.bignumber.equal(expectedTokenSupply)

    const event = logs.find(e => e.event === 'Burn')
    should.exist(event)
  })

  it('cannot burn more tokens than you have', async function () {
      try {
          await token.burn(2000, { from: accounts[1] })

      } catch(error) {
          ensuresException(error)
      }
  })
})
