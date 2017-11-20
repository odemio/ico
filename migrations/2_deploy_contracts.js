const ODEMToken = artifacts.require("./ODEMToken.sol");
const ODEMCrowdsale = artifacts.require("./ODEMCrowdsale.sol");
const BigNumber = web3.BigNumber
const dayInSecs = 86400

const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 80
const presaleEndTime = startTime + (86400 * 20) // 20 days
const endTime = startTime + (dayInSecs * 60) // 60 days
const rate = new BigNumber(500)

module.exports = function(deployer, network, [_, wallet]) {
    if(network == 'rinkeby' || network == 'testnet') {
        deployer.deploy(
            ODEMCrowdsale,
            startTime,
            presaleEndTime,
            endTime,
            rate,
            wallet
        );
    } else {
        // token deployed only for testing purposes. NOTE: dont use it for the mainnet.
        deployer.deploy(ODEMToken);

        deployer.deploy(
            ODEMCrowdsale,
            startTime,
            presaleEndTime,
            endTime,
            rate,
            wallet
        );
    }
};
