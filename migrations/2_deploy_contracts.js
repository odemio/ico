const ODEMToken = artifacts.require("./ODEMToken.sol");
const ODEMCrowdsale = artifacts.require("./ODEMCrowdsale.sol");
const Whitelist = artifacts.require("./Whitelist");
const BigNumber = web3.BigNumber
const dayInSecs = 86400

const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 80
const endTime = startTime + (dayInSecs * 60) // 60 days
const rate = new BigNumber(500)

module.exports = function(deployer, network, [_, wallet]) {
  if(network == 'rinkeby' || network == 'testnet') {
    return deployer
      .then(() => {
        return deployer.deploy(Whitelist);
      })
      .then(() => {
          return deployer.deploy(
              ODEMCrowdsale,
              startTime,
              endTime,
              Whitelist.address,
              rate,
              wallet
          );
      })
    } else {
      return deployer
        .then(() => {
          // token deployed only for testing purposes. NOTE: dont use it for the mainnet.
          deployer.deploy(ODEMToken);
          return deployer.deploy(Whitelist);
        })
        .then(() => {
            return deployer.deploy(
                ODEMCrowdsale,
                startTime,
                endTime,
                Whitelist.address,
                rate,
                wallet
            );
        })
    }
};
