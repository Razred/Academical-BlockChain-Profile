const hre = require("hardhat");

async function main() {
  const [deployer, student1, teacher1] = await hre.ethers.getSigners();

  console.log("Deploy from:", deployer.address);

  const Factory = await hre.ethers.getContractFactory("StudentFactory");
  const factory = await Factory.deploy();
  await factory .waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log(" Fabric has been deployed on address:", factoryAddress);

  const full_name = "Rashchukin Nikita Sergeevich";
  const group = "N34511";
  const student_id = "336939";
  
  const tx = await factory.createStudentProfile(
    student1.address,
    full_name,
    group,
    student_id
  );

  const receipt = await tx.wait();

  const profile_address = await factory.getProfileForStudent(student1.address);
  console.log("Student profile has been created on address:", profile_address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
