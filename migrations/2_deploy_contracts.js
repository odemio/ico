const ODEMToken = artifacts.require("./ODEMToken.sol");

module.exports = function(deployer, network, [_, wallet]) {
    // token deployed only for testing purposes. NOTE: dont use it for the mainnet.
    deployer.deploy(ODEMToken);
};
