import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { contractABI } from "./abis/contractABI";
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

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

export const signAndRespondToTask = async (
  taskIndex: number,
  taskCreatedBlock: number,
  taskName: string,
  contract: ethers.Contract
) => {
  const message = `Hello, ${taskName}`;
  const messageHash = ethers.utils.solidityKeccak256(["string"], [message]);
  const messageBytes = ethers.utils.arrayify(messageHash);
  const signature = await wallet.signMessage(messageBytes);

  console.log(`Signing and responding to task ${taskIndex}`);

  const tx = await contract.respondToTask(
    { name: taskName, taskCreatedBlock: taskCreatedBlock },
    taskIndex,
    signature
  );
  await tx.wait();
  console.log(`Responded to task.`);
};

const monitorNewTasks = async (
  wallet: ethers.Wallet,
  contract: ethers.Contract
) => {
  console.log(wallet.address);
  await contract.createNewTask("EigenWorld");
  const latestTaskNum = await contract.latestTaskNum();

  contract.on("NewTaskCreated", async (taskIndex: number, task: any) => {
    console.log(`New task detected: Hello, ${task.name}`);
    await signAndRespondToTask(
      taskIndex,
      task.taskCreatedBlock,
      task.name,
      contract
    );
    console.log(await contract.allTaskResponses[wallet.address][taskIndex]);
  });

  console.log("Monitoring for new tasks...");
  console.log(latestTaskNum);
  console.log((latestTaskNum - 1).toString());
  console.log(await contract.storedTask(0));
};

const main = async () => {
  monitorNewTasks(wallet, contract).catch((error) => {
    console.error("Error monitoring tasks:", error);
  });
};

main().catch((error) => {
  console.error("Error in main function:", error);
});
