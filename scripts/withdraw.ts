import { ethers, getNamedAccounts } from "hardhat";

const main = async () => {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("withdrawing..");
  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait(1);
  console.log("got it back");
};

main()
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });
