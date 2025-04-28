const { Web3 } = require("web3");
const fs = require("fs");
const path = require('path');

const web3 = new Web3("http://127.0.0.1:8545")

const abiPath = path.join(__dirname, "../01_contracts_Counter_sol_Counter.abi")
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

const contractAddress = "0x813f5c1A802375f01cDF1906B4aAEffD1766eF7b";

const counter = new web3.eth.Contract(abi, contractAddress);

async function increment() {
    const accounts = await web3.eth.getAccounts();
    await counter.methods.increment().send({ from: accounts[0] });
    const count = await counter.methods.getCount().call()

    console.log("Current count", count);

}

increment();