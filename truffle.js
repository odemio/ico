// Allows us to use ES6 in our migrations and tests.
require('babel-register')
require('babel-polyfill')

module.exports = {
  networks: {
    live: {
      network_id: 1, // Ethereum public network
      host: 'localhost',
      port: 8545,
      gas: 8000000
    },
    testnet: {
      network_id: 3, // Official Ethereum test network (Ropsten)
      host: 'localhost',
      port: 8545,
      gas: 8000000
    },
    rinkeby: {
      network_id: 4,
      host: 'localhost',
      port: 8545,
      gas: 8000000
    },
    development: {
      host: 'localhost',
      port: 8545,
      gas: 8000000,
      network_id: '*'
    }
  }
}
