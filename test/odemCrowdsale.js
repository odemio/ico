const ODEMCrowdsale = artifacts.require("./ODEMCrowdsale.sol");
const ODEMToken = artifacts.require("./ODEMToken.sol");

import { should, ensuresException, getBlockNow } from './helpers/utils'
import timer from './helpers/timer'

const BigNumber = web3.BigNumber

contract('ODEMCrowdsale', ([owner, wallet]) => {
    const rate = new BigNumber(500)
    const cap = new BigNumber(1000)
    const dayInSecs = 86400

    let startTime, endTime
    let crowdsale, token

    const newCrowdsale = (rate) => {
        startTime = getBlockNow() + 20 // crowdsale starts in 20 seconds
        endTime = getBlockNow() + dayInSecs * 60 // 60 days

        return ODEMCrowdsale.new(
            startTime,
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
})
