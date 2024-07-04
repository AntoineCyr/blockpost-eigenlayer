"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const contractABI_1 = require("./abis/contractABI");
const dotenv = __importStar(require("dotenv"));
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
const provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
const blockpostContractAddress = process.env.CONTRACT_ADDRESS;
// Create a contract instance
const blockpostContract = new ethers_1.ethers.Contract(blockpostContractAddress, contractABI_1.contractABI, wallet);
// Function to generate random names
function generateRandomName() {
    const adjectives = ["Quick", "Lazy", "Sleepy", "Noisy", "Hungry"];
    const nouns = ["Fox", "Dog", "Cat", "Mouse", "Bear"];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomName = `${adjective}${noun}${Math.floor(Math.random() * 1000)}`;
    return randomName;
}
function createNewTask(taskName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Send a transaction to the createNewTask function
            const tx = yield blockpostContract.createNewTask(taskName);
            // Wait for the transaction to be mined
            const receipt = yield tx.wait();
            console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
        }
        catch (error) {
            console.error("Error sending transaction:", error);
        }
    });
}
const monitorNewTasks = () => __awaiter(void 0, void 0, void 0, function* () {
    yield blockpostContract.createNewTask("EigenWorld");
    blockpostContract.on("NewTaskCreated", (taskIndex, task) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`New task detected: Hello, ${task.name}`);
    }));
});
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
