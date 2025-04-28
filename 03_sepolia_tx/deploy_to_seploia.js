require("dotenv").config();
const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");

const web3 = new Web3(process.env.SEPOLIA_RPC_URL);

const abiPath = path.join(__dirname, "../01_contracts_Counter_sol_Counter.abi");
const bytecodePath = path.join(__dirname, "../01_contracts_Counter_sol_Counter.bin");
const outputPath = path.join(__dirname, "etherscan_links.txt")

async function deployToSepolia() {
    try {
        if (!fs.existsSync(abiPath) || !fs.existsSync(bytecodePath)) {
            throw new Error('ABI.json or bytecode.json is not exist, compile first');
        }

        const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
        let bytecode = "0x" + fs.readFileSync(bytecodePath, "utf8").trim();

        if (!bytecode.startsWith("0x")) {
            throw Error("Not the correct Address")
        }

        const contract = new web3.eth.Contract(abi);

        console.log(abi);

        const account = web3.eth.accounts.privateKeyToAccount(
            process.env.PRIVATE_KEY
        );

        const lastBlock = await web3.eth.getBlock('latest');
        console.log(`last block: ${lastBlock.nonce}`);

        const deployTx = contract.deploy({ data: bytecode, arguments: [] });
        const gas = await deployTx.estimateGas();
        const gasPrice = await web3.eth.getGasPrice();
        const nonce = await web3.eth.getTransactionCount(account.address);


        const tx = {
            from: account.address,
            data: deployTx.encodeABI(),
            gas,
            gasPrice,
            nonce,
        }

        const signedTx = await web3.eth.accounts.signTransaction(
            tx,
            process.env.PRIVATE_KEY
        )
        const receipt = await web3.eth.sendSignedTransaction(
            signedTx.rawTransaction
        )

        const transactionHash = receipt.transactionHash
        console.log(`hash: ${transactionHash}`);

        const transaction = await web3.eth.getTransaction(transactionHash);
        console.log(`transaction: ${transaction}`);


        const links = `#Contract Address
        https://sepolia.etherscan.io/address/${receipt.contractAddress}
  
        # Deployment Transaction
        https://sepolia.etherscan.io/tx/${receipt.transactionHash}
      `;

        fs.writeFileSync(outputPath, links, 'utf8');
        console.log(`Etherscan link save to ${outputPath}`);



    } catch (err) {
        console.error('distribution Error:', err.message);
        if (err.message.includes('funds')) {
            console.error('check Sepolia wallet has ETH');
        }
    }
}

deployToSepolia()