const PullServiceClient = require("./pullServiceClient");
const { Web3 } = require("web3");
require("dotenv").config();

//SETTINGS
//-----------------------------------------------------------------------------------------------------------------
//Client Settings / SWITCH BETWEEN MAINNET AND TESTNET
const network = "testnet";
const contractAddress = "0xf28c6e30b991b84d336614c1256226272380c448"; // TESTNET Address of your smart contract

// const network = 'mainnet';
// const contractAddress = '0x58b22db5d8cd6735da74507eb1d1f49f18783b4b'; // MAINNET Address of your smart contract

//-----------------------------------------------------------------------------------------------------------------

//Supra gRPC Server Settings
const gRPCAddress = `${network}-dora.supraoracles.com`; // Set the gRPC server address. 'mainnet-dora.supraoracles.com' or 'testnet-dora.supraoracles.com' depending on where your contract is deployed.
const pairIndexes = [21]; // Set the pair indexes that you wish to request/use as an array - https://supra.com/docs/data-feeds/data-feeds-index
const chainType = "evm"; // Set the chain type (evm, sui, aptos)
const rpcUrl = `https://${network}.hashio.io/api`;

const contractAbi = require("../resources/abi.json"); // Path of your smart contract ABI
const walletAddress = process.env.WALLET_ADDRESS; //Your wallet address
const privateKey = process.env.PRIVATE_KEY; //Your private key
//-----------------------------------------------------------------------------------------------------------------

//Initialize web3
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl)); // Rpc url for desired chain

//Main function to obtain the proof bytes for requested pairs from Supra's gRPC server
async function main() {
	//Initialize the PullServiceClient and create the request object
	const client = new PullServiceClient(gRPCAddress);
	const request = {
		pair_indexes: pairIndexes,
		chain_type: chainType,
	};

	console.log("Requesting proof for price index : ", request.pair_indexes);

	//Get the proof from Supra's gRPC server
	client.getProof(request, (err, response) => {
		if (err) {
			console.error("Error:", err.details);
			return;
		}
		console.log("Calling contract to verify the proofs.. ");
		//Send the data to your smart contract
		callContract(response.evm);
	});
}

//This function is used to send the proof bytes (price data!) to the desired function of your deployed smart contract.
async function callContract(response) {
	//Bytes to Hex for calling function
	const hex = web3.utils.bytesToHex(response.proof_bytes);
	//Optional function call to output the extracted price data within your web2 app
	outputPriceData(hex);
	//Create the web3 contract object
	const contract = new web3.eth.Contract(contractAbi, contractAddress);

	//Set the name of your function that will receive the price/proof bytes.
	//-----------------------------------------------------------------------------------------------------------------
	const txData = contract.methods.deliverPriceData(hex).encodeABI(); // function from you contract eg: deliverPriceData
	console.log(0);

	// const gasEstimate = await contract.methods.deliverPriceData(hex).estimateGas({ from: walletAddress });
	//-----------------------------------------------------------------------------------------------------------------

	// Create the transaction object
	const transactionObject = {
		from: walletAddress,
		to: contractAddress,
		data: txData,
		// gas: gasEstimate,
		gas: 1000000,
		gasPrice: await web3.eth.getGasPrice(), // Set your desired gas price here, e.g: web3.utils.toWei('1000', 'gwei')
	};
	// Sign the transaction with the private key

	console.log(1);
	const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, privateKey);
	// Send the signed transaction
	console.log(2);
	const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
	console.log(2.1);
	console.log("Transaction receipt:", receipt);
}

//OPTIONAL function with example code to extract the price data from the proof bytes within your web2 application.
//Please note, that this extracted data is for use in your web2 application only and should not be delivered to your smart contract.
async function outputPriceData(hex) {
	const OracleProofABI = require("../resources/oracleProof.json"); // Interface for the Oracle Proof data
	const SignedCoherentClusterABI = require("../resources/signedCoherentCluster.json"); // Interface for the Signed pair cluster data
	let proof_data = web3.eth.abi.decodeParameters(OracleProofABI, hex); // Deserialising the Oracle Proof data
	let clusters = proof_data[0].clustersRaw; // Fatching the raw bytes of the signed pair cluster data
	let pairMask = proof_data[0].pairMask; // Fetching which pair ids is been requested
	let pair = 0; // Helps in iterating the vector of pair masking
	let pairId = []; // list of all the pair ids requested
	let pairPrice = []; // list of prices for the corresponding pair ids
	let pairDecimal = []; // list of pair decimals for the corresponding pair ids
	let pairTimestamp = []; // list of pair last updated timestamp for the corresponding pair ids
	//Extract the price data
	for (let i = 0; i < clusters.length; ++i) {
		let scc = web3.eth.abi.decodeParameters(SignedCoherentClusterABI, clusters[i]); // deserialising the raw bytes of the signed pair cluster data
		for (let j = 0; j < scc[0].cc.pair.length; ++j) {
			pair += 1;
			if (!pairMask[pair - 1]) {
				// verifying whether the pair is requested or not
				continue;
			}
			pairId.push(scc[0].cc.pair[j].toString(10)); // pushing the pair ids requested in the output vector
			pairPrice.push(scc[0].cc.prices[j].toString(10)); // pushing the pair price for the corresponding ids
			pairDecimal.push(scc[0].cc.decimals[j].toString(10)); // pushing the pair decimals for the corresponding ids requested
			pairTimestamp.push(scc[0].cc.timestamp[j].toString(10)); // pushing the pair timestamp for the corresponding ids requested
		}
	}
	console.log("Pair index : ", pairId);
	console.log("Pair Price : ", pairPrice);
	console.log("Pair Decimal : ", pairDecimal);
	console.log("Pair Timestamp : ", pairTimestamp);
}

main();
