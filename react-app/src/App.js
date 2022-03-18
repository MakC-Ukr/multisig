import './App.css';
// import {button} from 'react';
import { useEffect, useState } from 'react';
import Web3 from "web3";
var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Component
} = React;


let web3;
let accounts;


if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  window.ethereum.request({ method: "eth_requestAccounts" });
  web3 = new Web3(window.ethereum);
} else {
  const provider = new Web3.providers.HttpProvider(
    // "https://rinkeby.infura.io/v3/15c1d32581894b88a92d8d9e519e476c"
    "https://rinkeby.infura.io/v3/3653806d884b401498e7a07f3f325d2e"
  );
  web3 = new Web3(provider);
}



function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const { ethereum } = window;

  const checkWalletIsConnected = async () => {
    if (!ethereum) {
        console.log("Make sure you have Metamask installed!");
        return;
    } else {
        console.log("Wallet exists! We're ready to go!")
    }

    accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account);
    } else {
        console.log("No authorized account found");
    }
  }

  const connectWalletHandler = async () => {
  const { ethereum } = window;

  if (!ethereum) {
    alert("Please install Metamask!");
  }

  try {
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  const connectWalletButton = () => {
    return (<button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  async function signMessage() {

    // connect and get metamask account
    // message to sign
    const message = "This message will be signed";
    console.log({ message });

    // hash message
    const hashedMessage = web3.utils.sha3(message); // basically keccak256(message)
    // console.log({ hashedMessage });

    // // sign hashed message
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [hashedMessage, accounts[0]],
    });
    console.log({ signature });


    // // split signature
    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);
    const v = parseInt(signature.slice(130, 132), 16);
    console.log({ r, s, v });
  }

  // <button onClick={signMessage}>Sign Message</button>



  return (
    <div class="container">
      <div class="title">
        <h1>Multisig</h1>
      </div>
      <div class = "connect">
        {currentAccount ? <h3>Wallet connected</h3> : connectWalletButton()}
      </div>
      <div class = "tab">
          <h1>
            Table here
          </h1>
      </div>
    </div>
  );
}

export default App;
