# BlockPost AVS

**BlockPost** is built with the Eigenlayer SDK.

## Getting Started

To get started run:

```sh
yarn install
cp .env.local .env
```

### Deploy the contract

The blockchain is currently deployed on testnet HOLESKY, and the smart contract Blockpost stored in Anvil.
The Makefile has additionnal to build the contracts and redeploy them to Anvil if needed.

### Web Frontend

To set up and run the web frontend follow these steps:

```sh
make install-client
make run-client
```

### Interacting with the Blockchain

Open a web browser and navigate to http://localhost:3000.

# Send a Message:

Enter any message in the Send box to send it to the blockchain. It takes a few seconds
to reach the blockchain, be patient!

# Query a Message:

Enter any index in the Query box to query a specific message from the blockchain.

### Validate Messages

To validate messages sent in the front end, open a new terminal and run:

```sh
make start-operator
```

The new messages that you send in the front end will be validated by your operator.
Query the latest message you sent to verify if it is validated.

### Tests

# Onchain tests

```sh
make tests-contract
```

# Operator tests

You need to run anvil to make the test work.

First run:

```sh
make start-chain-with-contracts-deployed
```

On a new terminal:

```sh
make register-operator
make tests-offchain
```

### Design choices
# storedTask type
I decided to go with a mapping over an array.
Both do not have meaningfull differences, as the array would be acting like a mapping.
Since we are always inserting at the and using an index for the lookup, both operations would have O(1) time complexity,
just like a mapping.
Both will consume similar space as well.
Since the array would be acting like a mapping, I kept the contract convention and went for the mapping,
just like allTaskHashes and allTaskResponses.

# When storing
A choice had to be made between storing the message on task creation, or when responding to the task.
I decided to store the message on task creation, because we are able to query allTaskResponses to see if the task has been validated.
Overall it just stores the information in a faster way.

### Limitations
If you have an error sending a transaction, refresh the webpage.