import { ethers } from "ethers";
import { contractABI } from "./abis/contractABI";
import * as dotenv from "dotenv";
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
const blockpostContractAddress = process.env.CONTRACT_ADDRESS;

// Create a contract instance
const blockpostContract = new ethers.Contract(
  blockpostContractAddress,
  contractABI,
  wallet
);

// Function to generate random names
function generateRandomName(): string {
  const adjectives = ["Quick", "Lazy", "Sleepy", "Noisy", "Hungry"];
  const nouns = ["Fox", "Dog", "Cat", "Mouse", "Bear"];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomName = `${adjective}${noun}${Math.floor(Math.random() * 1000)}`;
  return randomName;
}

async function createNewTask(taskName: string) {
  try {
    // Send a transaction to the createNewTask function
    const tx = await blockpostContract.createNewTask(taskName);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
  } catch (error) {
    console.error("Error sending transaction:", error);
  }
}

const monitorNewTasks = async () => {
  await blockpostContract.createNewTask("EigenWorld");

  blockpostContract.on(
    "NewTaskCreated",
    async (taskIndex: number, task: any) => {
      console.log(`New task detected: Hello, ${task.name}`);
    }
  );
};

// Function to create a new task with a random name every 15 seconds
function startCreatingTasks() {
  setInterval(() => {
    const randomName = generateRandomName();
    console.log(`Creating new task with name: ${randomName}`);
    createNewTask(randomName);
  }, 15000);
}

// Start the process
startCreatingTasks();
monitorNewTasks().catch((error) => {
  console.error("Error monitoring tasks:", error);
});
