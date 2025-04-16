const hre = require("hardhat");

async function main() {
  const EduChain = await hre.ethers.getContractFactory("EduChain");

  const eduChain = await EduChain.deploy();

  await eduChain.waitForDeployment(); 

  const address = await eduChain.getAddress(); 
  console.log(`✅ EduChain deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
