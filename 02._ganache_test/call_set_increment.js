const { Web3 } = require("web3")
const { abi } = require("../01__contracts_Counter_sol_Counter.abi");

const web3 = new Web3("http://127.0.0.1:8545")

const contractAddress = " 0xD7627945fc266056672B810a1AF9C302Da795C31";

const counter = new web3.eth.Contract(abi, contractAddress);

async function increment() {
    await counter.methods.increment().send({ from: accounts[0] });
    const count = await counter.methods.count().call()
    console.log("Current count", count);

}

increment();