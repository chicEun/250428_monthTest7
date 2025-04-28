require("dotenv").config();
const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");

const web3 = new Web3(process.env.SEPOLIA_RPC_URL);

const abiPath = path.join(__dirname, "./01._contracts_Counter_sol_Counter.abi");
const bytecodePath = path.join(__dirname, "./01._contracts_Counter_sol_Counter.bin");
const outputPath = path.join(__dirname, "etherscan_links.txt")

async function deployToSepolia() {
    try {
        if (!fs.existsSync(abiPath) || !fs.existsSync(bytecodePath)) {
            'ABI.json or bytecode.json is not exist, compile first'
        }

        const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
        let bytecode = "0x" + fs.readFileSync(bytecodePath, "utf8");

        if (!bytecode.startsWith("0x")) {
            throw Error("Not the crrext Address")
        }

        const contract = new web3.eth.Contract(abi);

        const account = web3.eth.accounts.privateKeyToAccount(
            process.env.PRIVATE_KEY
        );

        const deployTx = contract.deploy({ data: bytecode, arguments: [] });
        const gas = await deployTx.estimateGas();
        const gasPrice = await web3.eth.getGasPrice();

        const tx = {
            from: account,
            data: deployTx.encodeABI(),
            gas,
            gasPrice
        }

        const signaedTx = await web3.eth.accounts.signTransaction(
            tx,
            process.env.PRIVATE_KEY
        )
        const receipt = await web3.eth.sendSignedTransaction(
            signaedTx.rawTransaction
        )
        const links = `# Contract Address
        https://sepolia.etherscan.io/address/${receipt.contractAddress}
  
        # Deployment Transaction
        https://sepolia.etherscan.io/tx/${receipt.transactionHash}
      `;

        fs.writeFileSync(outputPath, links, 'utf8');
        console.log(`Etherscan 링크가 ${outputPath}에 저장되었습니다.`);
    } catch (err) {
        console.error('배포 중 오류 발생:', err.message);
        if (err.message.includes('funds')) {
            console.error('Sepolia 지갑에 충분한 ETH가 있는지 확인하세요.');
        }
    }
}

deployToSepolia()