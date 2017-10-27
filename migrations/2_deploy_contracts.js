const ODEMToken = artifacts.require("./ODEMToken.sol");
const ODEMCrowdsale = artifacts.require("./ODEMCrowdsale.sol");
const BigNumber = web3.BigNumber
const dayInSecs = 86400

const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 80
const endTime = startTime + (dayInSecs * 60) // 60 days
const rate = new BigNumber(500)
const cap = new BigNumber(1000)

module.exports = function(deployer, network, [_, wallet]) {
    // token deployed only for testing purposes. NOTE: dont use it for the mainnet.
    deployer.deploy(ODEMToken);

    deployer.deploy(
        ODEMCrowdsale,
        startTime,
        endTime,
        rate,
        cap,
        wallet
    );
};
