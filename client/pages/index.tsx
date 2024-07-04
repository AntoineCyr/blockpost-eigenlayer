import type { NextPage } from "next";
import { BlockPost } from "../components/BlockPost";
import React from "react";

const Home: NextPage = () => {
  //return <FaucetSender rpcUrl="http://127.0.0.1:26657" faucetAddress="21312" />
  return (
    <BlockPost
      rpcUrl="http://127.0.0.1:8545"
      privateKey="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
      contractAddress="0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB"
    />
  );
};

export default Home;
