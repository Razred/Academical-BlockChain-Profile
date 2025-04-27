require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100, 
      },
    },
  },
  paths: {
    sources: "./contracts",  // путь к смарт-контрактам
    artifacts: "./artifacts" // путь к ABI и bytecode
  },
  networks: {
    hardhat: {}, // локальная сеть Hardhat
  },
};
