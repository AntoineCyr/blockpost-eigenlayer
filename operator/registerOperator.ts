import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { delegationABI } from "./abis/delegationABI";
import { contractABI } from "./abis/contractABI";
import { registryABI } from "./abis/registryABI";
import { avsDirectoryABI } from "./abis/avsDirectoryABI";
dotenv.config();

if (!process.env.RPC_URL) {
  throw new Error(`RPC_URL is undefined`);
}
if (!process.env.PRIVATE_KEY) {
  throw new Error(`PRIVATE_KEY is undefined`);
}
if (!process.env.CONTRACT_ADDRESS) {
  throw new Error(`CONTRACT_ADDRESS is undefined`);
}
if (!process.env.AVS_DIRECTORY_ADDRESS) {
  throw new Error(`AVS_DIRECTORY_ADDRESS is undefined`);
}
if (!process.env.STAKE_REGISTRY_ADDRESS) {
  throw new Error(`STAKE_REGISTRY_ADDRESS is undefined`);
}
if (!process.env.DELEGATION_MANAGER_ADDRESS) {
  throw new Error(`DELEGATION_MANAGER_ADDRESS is undefined`);
}

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const delegationManagerAddress = process.env.DELEGATION_MANAGER_ADDRESS;
const contractAddress = process.env.CONTRACT_ADDRESS;
const stakeRegistryAddress = process.env.STAKE_REGISTRY_ADDRESS;
const avsDirectoryAddress = process.env.AVS_DIRECTORY_ADDRESS;

const delegationManager = new ethers.Contract(
  delegationManagerAddress,
  delegationABI,
  wallet
);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);
const registryContract = new ethers.Contract(
  stakeRegistryAddress,
  registryABI,
  wallet
);
const avsDirectory = new ethers.Contract(
  avsDirectoryAddress,
  avsDirectoryABI,
  wallet
);

const registerOperator = async () => {
  const tx1 = await delegationManager.registerAsOperator(
    {
      earningsReceiver: wallet.address,
      delegationApprover: "0x0000000000000000000000000000000000000000",
      stakerOptOutWindowBlocks: 0,
    },
    ""
  );
  await tx1.wait();
  console.log("Operator registered on EL successfully");

  const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));
  const expiry = Math.floor(Date.now() / 1000) + 3600; // Example expiry, 1 hour from now

  // Define the output structure
  let operatorSignature = {
    expiry: expiry,
    salt: salt,
    signature: "",
  };

  // Calculate the digest hash using the avsDirectory's method
  const digestHash =
    await avsDirectory.calculateOperatorAVSRegistrationDigestHash(
      wallet.address,
      contract.address,
      salt,
      expiry
    );

  // Sign the digest hash with the operator's private key
  const signingKey = new ethers.utils.SigningKey(wallet.privateKey);
  const signature = signingKey.signDigest(digestHash);

  // Encode the signature in the required format
  operatorSignature.signature = ethers.utils.joinSignature(signature);

  const tx2 = await registryContract.registerOperatorWithSignature(
    operatorSignature,
    wallet.address
  );
  await tx2.wait();
  console.log("Operator registered on AVS successfully");
};

const main = async () => {
  await registerOperator();
};

main().catch((error) => {
  console.error("Error in main function:", error);
});
