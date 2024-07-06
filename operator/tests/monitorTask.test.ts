import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { contractABI } from "../abis/contractABI";
import { describe, test } from "@jest/globals";
jest.setTimeout(30000);

interface NewTask {
  name: string;
  index: number;
  blockNumber: number;
}

describe("monitorTask", () => {
  const RPC_URL = "http://127.0.0.1:8545";
  const PRIVATE_KEY =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const CONTRACT_ADDRESS = "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB";

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
  test("Monitor test", async () => {
    const task = await monitorNewTasks(wallet, contract);

    const allTaskResponses = await contract.allTaskResponses(
      wallet.address,
      task.index
    );
    const storedTask = await contract.storedTask(task.index);
    expect(task.name).toBe("EigenWorldMonitor");
    expect(storedTask).toBe("EigenWorldMonitor");
    expect(allTaskResponses).toBe(
      "0x16249e942759249f215ba6635a39bb1c77ea8aa0d79b92e23ad3b0cdaf26714131ab9a0781b22ec7d31e4a3dcfc967b0764bc79a6a6da959098351932605fc3d1c"
    );

    const allTaskResponsesBad = await contract.allTaskResponses(
      wallet.address,
      100
    );
    const storedTaskBad = await contract.storedTask(100);

    expect(storedTask).toBe("EigenWorldMonitor");
    expect(storedTaskBad).toBe("");
    expect(allTaskResponsesBad).toBe("0x");

    //Make sure respond with wrong value fails
    try {
      //wrong blockNumber
      await signAndRespondToTask(
        wallet,
        task.index,
        task.blockNumber + 1,
        task.name,
        contract
      );
      expect(1).toBe(0);
    } catch {
      expect(1).toBe(1);
    }

    try {
      //wrong Index
      await signAndRespondToTask(
        wallet,
        task.index + 1,
        task.blockNumber,
        task.name,
        contract
      );
      expect(1).toBe(0);
    } catch {
      expect(1).toBe(1);
    }

    try {
      //wrong Name
      await signAndRespondToTask(
        wallet,
        task.index,
        task.blockNumber,
        "Wrong name",
        contract
      );
      expect(1).toBe(0);
    } catch {
      expect(1).toBe(1);
    }
  });
});

async function monitorNewTasks(
  wallet: ethers.Wallet,
  contract: ethers.Contract
): Promise<NewTask> {
  return new Promise((resolve, reject) => {
    contract.createNewTask("EigenWorldMonitor");
    contract.once("NewTaskCreated", async (taskIndex: number, task: any) => {
      await signAndRespondToTask(
        wallet,
        taskIndex,
        task.taskCreatedBlock,
        task.name,
        contract
      );
      resolve({
        name: task.name,
        index: taskIndex,
        blockNumber: task.taskCreatedBlock,
      });
    });
  });
}

const signAndRespondToTask = async (
  wallet: ethers.Wallet,
  taskIndex: number,
  taskCreatedBlock: number,
  taskName: string,
  contract: ethers.Contract
) => {
  const message = `Hello, ${taskName}`;
  const messageHash = ethers.utils.solidityKeccak256(["string"], [message]);
  const messageBytes = ethers.utils.arrayify(messageHash);
  const signature = await wallet.signMessage(messageBytes);

  const tx = await contract.respondToTask(
    { name: taskName, taskCreatedBlock: taskCreatedBlock },
    taskIndex,
    signature
  );
  await tx.wait();
};
