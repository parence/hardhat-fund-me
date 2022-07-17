import { ethers, getNamedAccounts, network } from "hardhat";
import { devChain } from "../../helper-hardhat-config";
import { assert } from "chai";
import type { FundMe } from "../../typechain";

if (!devChain.includes(network.name)) {
  describe("FundMe", async () => {
    let fundMe: FundMe;
    let deployer;
    const sendValue = ethers.utils.parseEther("0.05");
    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer;
      console.log("deployer", deployer);
      fundMe = await ethers.getContract("FundMe", deployer);
    });

    it("allows people to fund and withdraw", async () => {
      await fundMe.fund({ value: sendValue });
      await fundMe.withdraw();
      const endingBalance = await fundMe.provider.getBalance(fundMe.address);
      assert.equal(endingBalance.toString(), "0");
    });
  });
}
