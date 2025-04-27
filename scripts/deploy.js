const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("🚀 Deploying contracts with address:", deployer.address);

  // Деплой фабрики
  const Factory = await hre.ethers.getContractFactory("StudentFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("✅ Factory deployed at:", factoryAddress);
}

main().catch((error) => {
  console.error("❌ Error during deployment:", error);
  process.exitCode = 1;
});
