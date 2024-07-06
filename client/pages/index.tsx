import type { NextPage } from "next";
import { BlockPost } from "../components/BlockPost";
import React from "react";

const Home: NextPage = () => {
  return (
    <BlockPost
      rpcUrl="https://1rpc.io/holesky"
      privateKey="0x548f34beb3641a94d79519a5cebd53e53fa71f5ee28a04206c303e35e4cf728e"
      contractAddress="0x027924cfdb1C0D6da16Ea8660d8Ff54Eb4Cfcb60"
    />
  );
};

export default Home;
