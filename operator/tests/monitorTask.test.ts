import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { contractABI } from "../abis/contractABI";
import { signAndRespondToTask } from "../monitorTask";
import { describe, expect, test } from "@jest/globals";
dotenv.config({ path: "../.env" });
describe("monitorTask", () => {
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
  test("should be correct", async () => {
    const [name, index] = await monitorNewTasks(contract);
    const allTaskHash = contract.allTaskHashes(index);
    const allTaskResponses = contract.allTaskResponses(index);
    const storedTask = contract.storedTask(index);

    expect(name).toBe("EigenWorldMonitor");
    expect(storedTask).toBe("EigenWorldMonitor");
    expect(allTaskHash).toBe("something");
    expect(allTaskResponses.length).toBe(1);
  });
  /*
  it("fetch wrong index", async () => {
    await monitorNewTasks(wallet, contract);
    const allTaskHash = contract.allTaskHashes(100);
    const allTaskResponses = contract.allTaskResponses(100);
    const storedTask = contract.storedTask(100);

    expect(storedTask).not.to.equal("EigenWorldMonitor");
    expect(allTaskHash).not.to.equal("something");
    expect(allTaskResponses.length).to.equal(0);
  });

  it("Sign and respond badly", async () => {
    //Expecting to catch an error
    try {
      await monitorNewTasksBadIndex(wallet, contract);
      expect(1).to.equal(0);
    } catch {
      expect(0).to.equal(0);
    }
    try {
      await monitorNewTasksBadBlock(wallet, contract);
      expect(1).to.equal(0);
    } catch {
      expect(0).to.equal(0);
    }
    try {
      await monitorNewTasksBadName(wallet, contract);
      expect(1).to.equal(0);
    } catch {
      expect(0).to.equal(0);
    }
  });*/
});

async function monitorNewTasks(contract: ethers.Contract) {
  await contract.createNewTask("EigenWorldMonitor");

  contract.on("NewTaskCreated", async (taskIndex: number, task: any) => {
    console.log(`New task detected: Hello, ${task.name}`);
    await signAndRespondToTask(
      taskIndex,
      task.taskCreatedBlock,
      task.name,
      contract
    );
    return [task.name, taskIndex];
  });
  return [];
}

async function monitorNewTasksBadIndex(contract: ethers.Contract) {
  await contract.createNewTask("EigenWorldMonitor");

  contract.on("NewTaskCreated", async (taskIndex: number, task: any) => {
    console.log(`New task detected: Hello, ${task.name}`);
    await signAndRespondToTask(
      taskIndex + 100,
      task.taskCreatedBlock,
      task.name,
      contract
    );
    return [task.name, taskIndex];
  });
  return [];
}

async function monitorNewTasksBadBlock(contract: ethers.Contract) {
  await contract.createNewTask("EigenWorldMonitor");

  contract.on("NewTaskCreated", async (taskIndex: number, task: any) => {
    console.log(`New task detected: Hello, ${task.name}`);
    await signAndRespondToTask(
      taskIndex,
      task.taskCreatedBlock + 1,
      task.name,
      contract
    );
    return [task.name, taskIndex];
  });
  return [];
}

async function monitorNewTasksBadName(contract: ethers.Contract) {
  await contract.createNewTask("EigenWorldMonitor");

  contract.on("NewTaskCreated", async (taskIndex: number, task: any) => {
    console.log(`New task detected: Hello, ${task.name}`);
    await signAndRespondToTask(
      taskIndex,
      task.taskCreatedBlock,
      "Bad Name",
      contract
    );
    return [task.name, taskIndex];
  });
  return [];
}
