const ODEMCrowdsale = artifacts.require('./ODEMCrowdsale.sol')
const TeamAndAdvisorsAllocation = artifacts.require('./TeamAndAdvisorsAllocation.sol')
const ODEMToken = artifacts.require('./ODEMToken.sol')

import { should, ensuresException, getBlockNow } from './helpers/utils'
import timer from './helpers/timer'

const BigNumber = web3.BigNumber

contract('ODEMCrowdsale', ([owner, wallet, buyer, buyer2, advisor1, advisor2]) => {
  const rate = new BigNumber(50)
  const newRate = new BigNumber(172000000)
  const dayInSecs = 86400
  const value = new BigNumber(1e18)

  const expectedCompanyTokens = new BigNumber(58914286e18)
  const expectedTeamAndAdvisorsAllocation = new BigNumber(14800000e18)

  let startTime, presaleEndTime, endTime
  let crowdsale, token
  let teamAndAdvisorsAllocationsContract

  const newCrowdsale = rate => {
    startTime = getBlockNow() + 20 // crowdsale starts in 20 seconds
    presaleEndTime = startTime + dayInSecs * 20 // 20 days
    endTime = startTime + dayInSecs * 60 // 60 days

    return ODEMCrowdsale.new(startTime, presaleEndTime, endTime, rate, wallet)
  }

  beforeEach('initialize contract', async () => {
    crowdsale = await newCrowdsale(rate)
    token = ODEMToken.at(await crowdsale.token())
  })

  it('has a normal crowdsale rate', async () => {
    const crowdsaleRate = await crowdsale.rate()
    crowdsaleRate.toNumber().should.equal(rate.toNumber())
  })

  it('starts with token paused', async () => {
    const paused = await token.paused()
    paused.should.equal(true)
  })

  it('finishes minting when crowdsale is finalized', async function() {
    crowdsale = await newCrowdsale(newRate)
    token = ODEMToken.at(await crowdsale.token())

    await timer(dayInSecs * 42)
    let finishMinting = await token.mintingFinished()
    finishMinting.should.be.false

    await crowdsale.buyTokens(buyer, { value })

    await timer(dayInSecs * 20)
    await crowdsale.finalize()

    finishMinting = await token.mintingFinished()
    finishMinting.should.be.true
  })

  describe('token purchases plus their bonuses', () => {
    it('does NOT buy tokens if crowdsale is paused', async () => {
      await timer(dayInSecs * 42)
      await crowdsale.pause()
      let buyerBalance

      try {
        await crowdsale.buyTokens(buyer, { value })
        assert.fail()
      } catch (e) {
        ensuresException(e)
      }

      buyerBalance = await token.balanceOf(buyer)
      buyerBalance.should.be.bignumber.equal(0)

      await crowdsale.unpause()
      await crowdsale.buyTokens(buyer, { value })

      buyerBalance = await token.balanceOf(buyer)
      buyerBalance.should.be.bignumber.equal(50e18)
    })

    it('has bonus of 20% during the presale', async () => {
      await timer(50) // within presale period
      await crowdsale.buyTokens(buyer2, { value })

      const buyerBalance = await token.balanceOf(buyer2)
      buyerBalance.should.be.bignumber.equal(625e17) // 25% bonus
    })

    it('stops presale once the presaleCap is reached', async () => {
      const newRate = new BigNumber(73714286)
      crowdsale = await newCrowdsale(newRate)
      token = ODEMToken.at(await crowdsale.token())
      await timer(50) // within presale period

      await crowdsale.buyTokens(buyer2, { value })

      try {
        await crowdsale.buyTokens(buyer, { value })
        assert.fail()
      } catch (e) {
        ensuresException(e)
      }

      const buyerBalance = await token.balanceOf(buyer)
      buyerBalance.should.be.bignumber.equal(0)
    })

    it('is also able to buy tokens with bonus by sending ether to the contract directly', async () => {
      await timer(50)
      await crowdsale.sendTransaction({ from: buyer, value })

      const purchaserBalance = await token.balanceOf(buyer)
      purchaserBalance.should.be.bignumber.equal(625e17) // 25% bonus
    })

    it('provides 0% bonus during crowdsale period', async () => {
      timer(dayInSecs * 42)
      await crowdsale.buyTokens(buyer2, { value })

      const buyerBalance = await token.balanceOf(buyer2)
      buyerBalance.should.be.bignumber.equal(50e18) // 0% bonus
    })
  })

  describe('#mintTokenForPrivateInvestors', function () {
    it('mints tokens for private investors after crowdsale has started', async () => {
      timer(50)

      await crowdsale.mintTokenForPrivateInvestors(buyer, rate, 0, value)

      const buyerBalance = await token.balanceOf(buyer)
      buyerBalance.should.be.bignumber.equal(50e18)
    })

    it('mints tokens to private investors before the crowdsale starts', async () => {
      const { logs } = await crowdsale.mintTokenForPrivateInvestors(buyer, rate, 0, value)

      const buyerBalance = await token.balanceOf(buyer)
      buyerBalance.should.be.bignumber.equal(50e18)

      const event = logs.find(e => e.event === 'PrivateInvestorTokenPurchase')
      should.exist(event)
    })
  })

  describe('change rate', () => {
    it('does NOT allows anyone to change rate other than the owner', async () => {
      const newRate = new BigNumber(60)

      try {
        await crowdsale.setRate(newRate, { from: buyer })
        assert.fail()
      } catch (e) {
        ensuresException(e)
      }

      const rate = await crowdsale.rate()
      rate.should.be.bignumber.equal(rate)
    })

    it('cannot set a rate that is zero', async () => {
      const zeroRate = new BigNumber(0)

      try {
        await crowdsale.setRate(zeroRate, { from: owner })
        assert.fail()
      } catch (e) {
        ensuresException(e)
      }

      const rate = await crowdsale.rate()
      rate.should.be.bignumber.equal(rate)
    })

    it('allows owner to change rate', async () => {
      const newRate = new BigNumber(60)
      await crowdsale.setRate(newRate, { from: owner })

      const rate = await crowdsale.rate()
      rate.should.be.bignumber.equal(newRate)
    })
  })

  describe('crowdsale finalization', function () {
    beforeEach(async function() {
      crowdsale = await newCrowdsale(newRate)
      token = ODEMToken.at(await crowdsale.token())

      await timer(dayInSecs * 42)

      await crowdsale.buyTokens(buyer, { value })

      await timer(dayInSecs * 20)
      await crowdsale.finalize()
    })

    it('assigns tokens correctly to company', async function() {
      const balanceCompany = await token.balanceOf(wallet)

      balanceCompany.should.be.bignumber.equal(expectedCompanyTokens)
    })

    it('token is unpaused after crowdsale ends', async function() {
      let paused = await token.paused()
      paused.should.be.false
    })
  })

  describe('teamAndAdvisorsAllocations', function () {
    beforeEach(async function() {
      crowdsale = await newCrowdsale(newRate)
      token = ODEMToken.at(await crowdsale.token())

      await timer(50)

      await crowdsale.buyTokens(buyer, { value })

      timer(dayInSecs * 70)
      await crowdsale.finalize()

      const teamAndAdvisorsAllocations = await crowdsale.teamAndAdvisorsAllocation()
      teamAndAdvisorsAllocationsContract = TeamAndAdvisorsAllocation.at(teamAndAdvisorsAllocations)
    })

    it('assigns tokens correctly to TeamAndAdvisorsAllocation contract', async function() {
      const teamOrAdvisorsAddress = await teamAndAdvisorsAllocationsContract.address

      const balance = await token.balanceOf(teamOrAdvisorsAddress)
      balance.should.be.bignumber.equal(expectedTeamAndAdvisorsAllocation)
    })

    it('adds advisors and their allocation', async function() {
      await teamAndAdvisorsAllocationsContract.addTeamAndAdvisorsAllocation(advisor1, 800)
      await teamAndAdvisorsAllocationsContract.addTeamAndAdvisorsAllocation.sendTransaction(advisor2, 1000, {
        from: owner
      })
      const allocatedTokens = await teamAndAdvisorsAllocationsContract.allocatedTokens()
      allocatedTokens.should.be.bignumber.equal(1800)

      const allocationsForFounder1 = await teamAndAdvisorsAllocationsContract.teamAndAdvisorsAllocations.call(advisor1)
      const allocationsForFounder2 = await teamAndAdvisorsAllocationsContract.teamAndAdvisorsAllocations.call(advisor2)
      allocationsForFounder1.should.be.bignumber.equal(800)
      allocationsForFounder2.should.be.bignumber.equal(1000)
    })

    it('does NOT unlock advisors allocation before the unlock period is up', async function() {
      await teamAndAdvisorsAllocationsContract.addTeamAndAdvisorsAllocation(advisor1, 800)
      await teamAndAdvisorsAllocationsContract.addTeamAndAdvisorsAllocation.sendTransaction(advisor2, 1000, {
        from: owner
      })

      try {
        await teamAndAdvisorsAllocationsContract.unlock({ from: advisor1 })
        assert.fail()
      } catch (e) {
        ensuresException(e)
      }

      const tokensCreated = await teamAndAdvisorsAllocationsContract.tokensCreated()
      tokensCreated.should.be.bignumber.equal(0)
    })

    it('unlocks advisors allocation after the unlock period is up', async function() {
      let tokensCreated
      await teamAndAdvisorsAllocationsContract.addTeamAndAdvisorsAllocation(advisor1, 800)
      await teamAndAdvisorsAllocationsContract.addTeamAndAdvisorsAllocation.sendTransaction(advisor2, 1000, {
        from: owner
      })

      tokensCreated = await teamAndAdvisorsAllocationsContract.tokensCreated()
      tokensCreated.should.be.bignumber.equal(0)

      await timer(dayInSecs * 190)

      await teamAndAdvisorsAllocationsContract.unlock({ from: advisor1 })
      await teamAndAdvisorsAllocationsContract.unlock({ from: advisor2 })

      const tokenBalanceFounder1 = await token.balanceOf(advisor1)
      const tokenBalanceFounder2 = await token.balanceOf(advisor2)
      tokenBalanceFounder1.should.be.bignumber.equal(800)
      tokenBalanceFounder2.should.be.bignumber.equal(1000)
    })

    it('does NOT kill contract before one year is up', async function() {
      await teamAndAdvisorsAllocationsContract.addTeamAndAdvisorsAllocation(advisor1, 800)
      await teamAndAdvisorsAllocationsContract.addTeamAndAdvisorsAllocation.sendTransaction(advisor2, 1000, {
        from: owner
      })

      try {
        await teamAndAdvisorsAllocationsContract.kill()
        assert.fail()
      } catch (e) {
        ensuresException(e)
      }

      const teamOrAdvisorsAddress = await teamAndAdvisorsAllocationsContract.address
      const balance = await token.balanceOf(teamOrAdvisorsAddress)
      balance.should.be.bignumber.equal(expectedTeamAndAdvisorsAllocation)

      const tokensCreated = await teamAndAdvisorsAllocationsContract.tokensCreated()
      tokensCreated.should.be.bignumber.equal(0)
    })

    it('is able to kill contract after one year', async () => {
      await teamAndAdvisorsAllocationsContract.addTeamAndAdvisorsAllocation.sendTransaction(advisor2, 1000, {
        from: owner
      })

      const tokensCreated = await teamAndAdvisorsAllocationsContract.tokensCreated()
      tokensCreated.should.be.bignumber.equal(0)

      await timer(dayInSecs * 400) // 400 days after

      await teamAndAdvisorsAllocationsContract.kill()

      const teamOrAdvisorsAddress = await teamAndAdvisorsAllocationsContract.address
      const balance = await token.balanceOf(teamOrAdvisorsAddress)
      balance.should.be.bignumber.equal(0)

      const balanceOwner = await token.balanceOf(owner)
      balanceOwner.should.be.bignumber.equal(expectedTeamAndAdvisorsAllocation)
    })
  })
})
