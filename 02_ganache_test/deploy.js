const fs = require('fs');
const path = require('path');
const { Web3 } = require('web3');

const web3 = new Web3("http://127.0.0.1:8545");

const abiPath = path.join(__dirname, "../01_contracts_Counter_sol_Counter.abi")
const bytecodePath = path.join(__dirname, "../01_contracts_Counter_sol_Counter.bin");


const deploy = async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        const contract = new web3.eth.Contract(JSON.parse(fs.readFileSync(abiPath, "utf8")));
        const deployTx = contract.deploy({
            data: "0x" + fs.readFileSync(bytecodePath, "utf8"),
            arguments: []
        })

        const gas = await deployTx.estimateGas();
        const result = await deployTx.send({
            from: account,
            gas: gas,
            gasPrice: await web3.eth.getGasPrice()
        })

        console.log("success", result.options.address);

    } catch (error) {
        console.log(error);

    }
}

deploy()