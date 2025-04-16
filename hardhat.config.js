require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.18",
  paths: {
    sources: "./contracts", // путь к смарт-контрактам
    artifacts: "./artifacts" // путь к ABI и bytecode
  },
  networks: {
    hardhat: {}, // локальная сеть Hardhat
  },
};
