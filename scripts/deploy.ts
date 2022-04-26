// scripts/deploy.ts
import { ethers, upgrades } from "hardhat";

async function main() {
  const MetaCraftZone = await ethers.getContractFactory("MetaCraftZone");
  console.log("Deploying MetaCraftZone...");
  const box = await upgrades.deployProxy(MetaCraftZone);

  console.log(box.address, " box(proxy) address");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
