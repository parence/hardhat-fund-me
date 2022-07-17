import { ethers, getNamedAccounts } from "hardhat";

const main = async () => {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("funding contract...");
  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"),
  });
  const transactionReceipt = await transactionResponse.wait(1);
  console.log("funded");
};

main()
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });
