type NetworkConfig = {
  name: string;
  ethUsdPriceFeed: string;
};
const networkConfig: Record<number, NetworkConfig> = {
  4: {
    name: "rinkeby",
    ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
  },
  137: {
    name: "matic",
    ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
};

const devChain = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 2000 * 10 ** DECIMALS;

export { networkConfig, devChain, DECIMALS, INITIAL_ANSWER };
