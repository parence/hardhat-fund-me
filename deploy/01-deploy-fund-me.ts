import { HardhatRuntimeEnvironment } from "hardhat/types";
import { network } from "hardhat";
import { devChain, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const func = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId as number;

  //   const ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  let ethUsdPriceFeedAddress;
  if (devChain.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }
  console.log("deployer: ", deployer);
  //   const { deployer } = getNamedAccounts();
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: 1,
  });

  if (!devChain.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    // verify
    console.log("verifying");
    await verify(fundMe.address, args);
  }
  log("=================");
};

export default func;
func.tags = ["all", "fundme"];
