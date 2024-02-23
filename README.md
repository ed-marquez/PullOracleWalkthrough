# Supra Demo on Hedera

This example shows how to use Supra Oracles real-world data feeds. It fetches and verifies price data from Supra's gRPC server and use it within a smart contract on the Hedera network. These are key files:

## [`main.js`](./client/main.js)

This `main` script interfaces with the Supra Oracle to request price data proofs for a specified pair. It demonstrates the initialization of a PullServiceClient, the request for data proofs, and the interaction with a smart contract deployed on Hedera to deliver the obtained price data.

The script enables switching between the Hedera mainnet and testnet environments. It uses Web3.js and includes functions to sign and send transactions to Hedera, estimate gas, and extract price data.

## [`MockOracleClient.sol`](./smartcontract/MockOracleClient.sol)

This Solidity smart contract acts as a mock client for consuming oracle pull data. It defines a structure for the price data and a function to receive and process the verified oracle proof bytes.

# Try this Example on Your Broswer with GitPod

1. Go to [this link](https://gitpod.io/#https://github.com/hedera-dev/hedera-example-supra-oracle-contract)

2. Run the following commands on the terminal:

   `cd client` `npm init --y` `npm install`

3. Rename the file `.env.SAMPLE` to `.env` and enter you Hedera network credentials (testnet/mainnet):

   `cp .env.SAMPLE .env`

4. Run the `main.js` script:

   `node main.js`

   You should see a console output similar to:
   ![Console Output](./images/console_output.png)
