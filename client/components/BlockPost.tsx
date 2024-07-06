import { ChangeEvent, Component, MouseEvent } from "react";
import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import { contractABI } from "../../operator/abis/contractABI";

export interface BlockPostProps {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
}

interface BlockPostState {
  message: string;
  index: string;
  toSend: string;
  toSendIndex: string;
  toSendMnemonic: string;
  walletAddress: string;
  status: string;
  validated: string;
  contract?: ethers.Contract;
}

export class BlockPost extends Component<BlockPostProps, BlockPostState> {
  // Set the initial state
  constructor(props: BlockPostProps) {
    super(props);
    this.state = {
      index: "",
      message: "",
      toSend: "",
      toSendIndex: "",
      toSendMnemonic: "",
      walletAddress: "",
      status: "",
      validated: "",
    };
    setTimeout(this.init, 500);
  }
  init = async () => {
    this.initializeContract();
  };
  initializeContract() {
    const { rpcUrl, privateKey, contractAddress } = this.props;
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const blockpostContract = new ethers.Contract(
      contractAddress,
      contractABI,
      wallet
    );
    this.setState({
      contract: blockpostContract,
      status: "Contract imported",
      walletAddress: wallet.address,
    });
  }

  async createTask(taskName: string) {
    try {
      // Send a transaction to the createNewTask function
      const tx = await this.state.contract!.createNewTask(taskName);
      //const tx = await blockpostContract.createNewTask(taskName);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      const latestTaskNum = await this.state.contract!.latestTaskNum();

      this.setState({
        status: "Transaction succeeded",
        message: taskName,
        index: (latestTaskNum - 1).toString(),
        validated: "No",
      });
    } catch (error) {
      console.error("Error sending transaction:", error);
      this.setState({
        status: "Error sending transaction",
        validated: "",
        message: "",
        index: "",
      });
    }
  }

  async queryMessage(index: string) {
    try {
      const message = await this.state.contract!.storedTask(index);
      const validated =
        (await this.state.contract!.allTaskResponses(
          this.state.walletAddress,
          index
        )) == "0x"
          ? "No"
          : "Yes";
      this.setState({
        message: message,
        index: index,
        status: "Successful query",
        validated: validated,
      });
    } catch {
      this.setState({
        status: "Contract not initialized",
        validated: "",
        message: "",
        index: "",
      });
    }
  }

  onToSendChanged = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      toSend: e.currentTarget.value,
    });
  };

  onToSendChangedIndex = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      toSendIndex: e.currentTarget.value,
    });
  };

  onSendClicked = async (e: MouseEvent<HTMLButtonElement>) => {
    await this.createTask(this.state.toSend);
    this.setState({
      toSend: "",
    });
  };

  onSendClickedIndex = async (e: MouseEvent<HTMLButtonElement>) => {
    const { toSendIndex } = this.state;
    await this.queryMessage(toSendIndex);
    this.setState({
      toSendIndex: "",
    });
  };

  // The render function that draws the component at init and at state change
  render() {
    const { toSend, index, message, toSendIndex, status, validated } =
      this.state;
    const { rpcUrl } = this.props;
    // The web page structure itself
    return (
      <div>
        <div className={styles.description}></div>
        <fieldset className={styles.card}>
          <legend>Blockpost Eigenlayer</legend>
          <p>RpcUrl: {rpcUrl}</p>
          <p>Message: {message}</p>
          <p>Index: {index}</p>
          <p>Validated: {validated}</p>
          <p>Status: {status}</p>
        </fieldset>
        <fieldset className={styles.card}>
          <legend>Send</legend>
          <p>Message:</p>
          <input value={toSend} type="string" onChange={this.onToSendChanged} />
          <button onClick={this.onSendClicked}>Send to blockchain</button>
        </fieldset>
        <fieldset className={styles.card}>
          <legend>Query</legend>
          <p>Index</p>
          <input
            value={toSendIndex}
            type="number"
            onChange={this.onToSendChangedIndex}
          />
          <button onClick={this.onSendClickedIndex}>Query Blockchain</button>
        </fieldset>
      </div>
    );
  }
}
