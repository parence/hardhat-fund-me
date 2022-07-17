import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import type { Address } from "hardhat-deploy/dist/types";
import { FundMe } from "../../typechain/FundMe";
import { MockV3Aggregator } from "../../typechain/MockV3Aggregator";
import { devChain } from "../../helper-hardhat-config";

if (devChain.includes(network.name)) {
  describe("FundMe", () => {
    let fundMe: FundMe;
    let deployer: Address;
    let mockV3Aggregator: MockV3Aggregator;
    const sendValue = ethers.utils.parseEther("0.05");
    beforeEach(async () => {
      // using hardhat deploy
      console.log("before");
      deployer = (await getNamedAccounts()).deployer;
      await deployments.fixture(["all"]);
      console.log("deployed");
      fundMe = await ethers.getContract("FundMe", deployer);
      console.log("fundme");
      mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    });
    describe("constructor", () => {
      it("sets the aggergator addresses correctly", async () => {
        const response = await fundMe.getPriceFeed();
        assert.equal(response, mockV3Aggregator.address);
      });
    });

    describe("fund", async () => {
      it("fails if you don't send enough ETH", async () => {
        await expect(fundMe.fund()).to.be.revertedWith(
          "You need to spend more ETH!"
        );
      });
      it("updated the amount funded data structure", async () => {
        await fundMe.fund({ value: sendValue });
        const response = await fundMe.getAddressToAmountFunded(deployer);
        assert.equal(response.toString(), sendValue.toString());
      });
      it("adds funder to array of funders", async () => {
        await fundMe.fund({ value: sendValue });
        const funder = await fundMe.getFunder(0);
        assert.equal(funder, deployer);
      });
    });

    describe("withdraw", async () => {
      beforeEach(async () => {
        await fundMe.fund({ value: sendValue });
      });
      it("can withdraw ETH from a single funder", async () => {
        const startingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );
        const startingDeployerBalance = await fundMe.provider.getBalance(
          deployer
        );

        const transactionResponse = await fundMe.withdraw();
        const transactionReceipt = await transactionResponse.wait(1);
        const gasCost = transactionReceipt.gasUsed.mul(
          transactionReceipt.effectiveGasPrice
        );

        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );
        const endingDeployerBalance = await fundMe.provider.getBalance(
          deployer
        );
        assert.equal(endingFundMeBalance.toString(), "0");
        assert.equal(
          startingFundMeBalance.add(startingDeployerBalance).toString(),
          endingDeployerBalance.add(gasCost).toString()
        );
      });
      it("allows us to withdraw with multiple funders", async () => {
        const accounts = await ethers.getSigners();
        for (let i = 1; i < 6; i++) {
          const fundMeConnectedContract = fundMe.connect(accounts[i]);
          await fundMeConnectedContract.fund({ value: sendValue });
        }
        const startingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );
        const startingDeployerBalance = await fundMe.provider.getBalance(
          deployer
        );

        const transactionResponse = await fundMe.withdraw();
        const transactionReceipt = await transactionResponse.wait(1);
        const gasCost = transactionReceipt.gasUsed.mul(
          transactionReceipt.effectiveGasPrice
        );
        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );
        const endingDeployerBalance = await fundMe.provider.getBalance(
          deployer
        );
        assert.equal(endingFundMeBalance.toString(), "0");
        assert.equal(
          startingFundMeBalance.add(startingDeployerBalance).toString(),
          endingDeployerBalance.add(gasCost).toString()
        );

        await expect(fundMe.getFunder(0)).to.be.reverted;

        for (let i = 1; i < 6; i++) {
          assert.equal(
            (
              await fundMe.getAddressToAmountFunded(accounts[i].address)
            ).toString(),
            "0"
          );
        }
      });
      it("only allows the owner to withdraw", async () => {
        const accounts = await ethers.getSigners();
        const attacker = accounts[1];
        const attackerConnectedContract = fundMe.connect(attacker);
        await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
          "FundMe__NotOwner"
        );
      });
      it("allows us to cheaper withdraw with multiple funders", async () => {
        const accounts = await ethers.getSigners();
        for (let i = 1; i < 6; i++) {
          const fundMeConnectedContract = fundMe.connect(accounts[i]);
          await fundMeConnectedContract.fund({ value: sendValue });
        }
        const startingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );
        const startingDeployerBalance = await fundMe.provider.getBalance(
          deployer
        );

        const transactionResponse = await fundMe.cheaperWithdraw();
        const transactionReceipt = await transactionResponse.wait(1);
        const gasCost = transactionReceipt.gasUsed.mul(
          transactionReceipt.effectiveGasPrice
        );
        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );
        const endingDeployerBalance = await fundMe.provider.getBalance(
          deployer
        );
        assert.equal(endingFundMeBalance.toString(), "0");
        assert.equal(
          startingFundMeBalance.add(startingDeployerBalance).toString(),
          endingDeployerBalance.add(gasCost).toString()
        );

        await expect(fundMe.getFunder(0)).to.be.reverted;

        for (let i = 1; i < 6; i++) {
          assert.equal(
            (
              await fundMe.getAddressToAmountFunded(accounts[i].address)
            ).toString(),
            "0"
          );
        }
      });
    });
  });
}
