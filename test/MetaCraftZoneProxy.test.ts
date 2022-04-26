// test/MetaCraftZoneProxy.test.ts
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";

describe("MetaCraftZone", function () {
  let mcz: Contract;
  let owner: Signer;
  let user: Signer;
  let userAddress: string;
  let manyTokens: BigNumber;

  beforeEach(async function () {
    const MetaCraftZone = await ethers.getContractFactory("MetaCraftZone");
    mcz = await upgrades.deployProxy(MetaCraftZone);
    await mcz.deployed();
    const accounts: Signer[] = await ethers.getSigners();
    owner = accounts[0];
    user = accounts[1];
    userAddress = await user.getAddress();
    const decimals = await mcz.decimals();
    manyTokens = BigNumber.from(10).pow(decimals).mul(100000000000);
  });

  it("createStake creates a stake.", async () => {
    await mcz.connect(owner).transfer(userAddress, 3);
    await mcz.connect(user).createStake(1);

    expect(await mcz.balanceOf(userAddress)).to.equal(BigNumber.from(2));
    expect(await mcz.stakeOf(userAddress)).to.equal(BigNumber.from(1));
    expect(await mcz.totalSupply()).to.equal(manyTokens.sub(1));
    expect(await mcz.totalStakes()).to.equal(BigNumber.from(1));
  });

  it("rewards are distributed.", async () => {
    await mcz.connect(owner).transfer(userAddress, 100);
    await mcz.connect(user).createStake(100);
    await mcz.connect(owner).distributeRewards();

    expect(await mcz.rewardOf(userAddress)).to.equal(BigNumber.from(1));
    expect(await mcz.totalRewards()).to.equal(BigNumber.from(1));
  });

  it("rewards can be withdrawn.", async () => {
    await mcz.connect(owner).transfer(userAddress, 100);
    await mcz.connect(user).createStake(100);
    await mcz.connect(owner).distributeRewards();
    await mcz.connect(user).withdrawReward();

    const initialSupply = manyTokens;
    const existingStakes = 100;
    const mintedAndWithdrawn = 1;

    expect(await mcz.balanceOf(userAddress)).to.equal(BigNumber.from(1));
    expect(await mcz.stakeOf(userAddress)).to.equal(BigNumber.from(100));
    expect(await mcz.rewardOf(userAddress)).to.equal(BigNumber.from(0));
    expect(await mcz.totalSupply()).to.equal(
      initialSupply.sub(existingStakes).add(mintedAndWithdrawn)
    );
    expect(await mcz.totalStakes()).to.equal(BigNumber.from(100));
    expect(await mcz.totalRewards()).to.equal(BigNumber.from(0));
  });
});
