const ODEMCrowdsale = artifacts.require("./ODEMCrowdsale.sol");
const ODEMToken = artifacts.require("./ODEMToken.sol");

import { should, ensuresException, getBlockNow } from './helpers/utils'
import timer from './helpers/timer'

const BigNumber = web3.BigNumber

contract('ODEMCrowdsale', ([owner, wallet, buyer, buyer2]) => {
    const rate = new BigNumber(50)
    const cap = new BigNumber(1000000000e+18)
    const dayInSecs = 86400
    const value = new BigNumber(1e+18)

    const expectedCompanyTokens = new BigNumber(73714286e+18);

    let startTime, presaleEndTime, endTime
    let crowdsale, token

    const newCrowdsale = (rate) => {
        startTime = getBlockNow() + 20 // crowdsale starts in 20 seconds
        presaleEndTime = startTime + (dayInSecs * 20) // 20 days
        endTime = getBlockNow() + dayInSecs * 60 // 60 days

        return ODEMCrowdsale.new(
            startTime,
            presaleEndTime,
            endTime,
            rate,
            cap,
            wallet
        )
    }

    beforeEach('initialize contract', async () => {
        crowdsale = await newCrowdsale(rate)
        token = ODEMToken.at(await crowdsale.token())
    })

    it('has a cap', async () => {
        const crowdsaleCap = await crowdsale.cap()
        crowdsaleCap.toNumber().should.equal(cap.toNumber())
    });

    it('has a normal crowdsale rate', async () => {
        const crowdsaleRate = await crowdsale.rate()
        crowdsaleRate.toNumber().should.equal(rate.toNumber())
    })

    it('starts with token paused', async () => {
        const paused = await token.paused()
        paused.should.equal(true)
    })

    describe('token purchases plus their bonuses', () => {
        it('does NOT buy tokens if crowdsale is paused', async () => {
            await timer(dayInSecs * 42)
            await crowdsale.pause()
            let buyerBalance

            try {
                await crowdsale.buyTokens(buyer, { value })
                assert.fail()
            } catch(e) {
                ensuresException(e)
            }

            buyerBalance = await token.balanceOf(buyer)
            buyerBalance.should.be.bignumber.equal(0)

            await crowdsale.unpause()
            await crowdsale.buyTokens(buyer, { value })

            buyerBalance = await token.balanceOf(buyer)
            buyerBalance.should.be.bignumber.equal(50e+18)
        })

        it('has bonus of 20% during the presale', async () => {
            await timer(50) // within presale period
            await crowdsale.buyTokens(buyer2, { value })

            const buyerBalance = await token.balanceOf(buyer2)
            buyerBalance.should.be.bignumber.equal(625e+17) // 25% bonus
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
            purchaserBalance.should.be.bignumber.equal(625e+17) // 25% bonus
        })

        it('provides 0% bonus during crowdsale period', async () => {
            timer(dayInSecs * 42)
            await crowdsale.buyTokens(buyer2, { value })

            const buyerBalance = await token.balanceOf(buyer2)
            buyerBalance.should.be.bignumber.equal(50e+18) // 0% bonus
        })
    })

    describe('crowdsale finalization', () => {
        beforeEach('finalizes crowdsale and assigns tokens to company', async () => {
            crowdsale = await newCrowdsale(rate)
            token = ODEMToken.at(await crowdsale.token())

            timer(dayInSecs * 62)

            await crowdsale.finalize()
            await crowdsale.unpauseToken() // unpause token so transfer is permitted
        })

        it('assigns tokens correctly to company', async function () {
            const balanceCompany = await token.balanceOf(wallet)
            balanceCompany.should.be.bignumber.equal(expectedCompanyTokens)
        })
    })
})
