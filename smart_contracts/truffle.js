var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = 'theory control chief borrow device layer simple mother era around fiscal noble';

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: function() { 
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/157c8d4397074a84ab75275a58380964') 
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
    }
  }
};