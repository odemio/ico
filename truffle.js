// Allows us to use ES6 in our migrations and tests.
require('babel-register')
require('babel-polyfill')

module.exports = {
  networks: {
      live: {
        network_id: 1, // Ethereum public network
        host: "localhost",
        port: 8545,
      },
      testnet: {
        network_id: 3, // Official Ethereum test network (Ropsten)
        host: "localhost",
        port: 8545,
      },
      rinkeby: {
        network_id: 4,
        host: "localhost",
        port: 8545,
      },
      development: {
        host: 'localhost',
        port: 8545,
        network_id: '*',
      }
  }
}
