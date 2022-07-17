import { HardhatRuntimeEnvironment } from "hardhat/types";
import { network } from "hardhat";
import { devChain, DECIMALS, INITIAL_ANSWER } from "../helper-hardhat-config";

const func = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  //   const chainId = network.config.chainId as number;

  if (devChain.includes(network.name)) {
    log("local network detected! deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("mock deployed");
    log("=====================");
  }
};

export default func;
func.tags = ["all", "mocks"];
