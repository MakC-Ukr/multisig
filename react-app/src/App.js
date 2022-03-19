import "./App.css";
// import {button} from 'react';
import React from "react";
import { useEffect, useState } from "react";
import Web3 from "web3";
import multisig from "./multisig";
import { Table, Avatar, ConnectButton, Button, Tag, Icon } from "web3uikit";
import { render } from "@testing-library/react";

let web3;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  window.ethereum.request({ method: "eth_requestAccounts" });
  web3 = new Web3(window.ethereum);
} else {
  const provider = new Web3.providers.HttpProvider(
    "https://rinkeby.infura.io/v3/3653806d884b401498e7a07f3f325d2e"
  );
  web3 = new Web3(provider);
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      c_Txns: [],
      txns_loaded: false,
      txns_frontend: [],
      currentAccount: '',
      accountConnected : false,
      accounts: [],
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  // const temp = this;

  componentDidMount() {
    // <button onClick={signMessage}>Sign Message</button>
    var self = this;
    async function fetchContractData() {
      var c_qtyTxn = await multisig.methods.qtyTxn().call();
      // console.log("c_qtyTxn: ", c_qtyTxn);
      for (var i = 0; i < c_qtyTxn; i++) {
        self.state.c_Txns[i] = await multisig.methods.txns(i).call();
        self.state.txns_frontend[i] = [
          <Avatar isRounded theme="image" />,
          self.state.c_Txns[i]["desc"],
          self.state.c_Txns[i]["to"],
          self.state.c_Txns[i]["val"],
          // <button
          //   // color="blue"
          //   // id="test-button-colored-blue"
          //   onClick={(e) => {
          //       console.log("I= ",e.target.value);
          //       signMessage(self.state.c_Txns[i]['data']);
          //     }
          //   }
          //   // text="Approve"
          //   // theme="colored"
          //   // type="button"
          //   >{i}</button>
          <Button
            onClick={async (e)=>{
              // console.log(e.target);
              var txt = e.target.innerText;
              // console.log("I = ", txt.slice(12,txt.length));
              const temp_data = self.state.c_Txns[txt.slice(12,txt.length)]['data'];
              const temp_to = self.state.c_Txns[txt.slice(12,txt.length)]['to'];
              const temp_val = self.state.c_Txns[txt.slice(12,txt.length)]['val'];
              const message = temp_to+temp_val+temp_data;
              // console.log({message});
              const hashedMessage = web3.utils.sha3(message);
              // console.log({ hashedMessage });
              // const accs= await window.ethereum.request({ method: 'eth_accounts' });
              const signature = await window.ethereum.request({
              method: "personal_sign",
                params: [hashedMessage, self.state.accounts[0]],
              });
              console.log({ signature });
              const r = signature.slice(0, 66);
              const s = "0x" + signature.slice(66, 130);
              const v = parseInt(signature.slice(130, 132), 16);
              // console.log({ r, s, v });
              }
            }
            text={"Approve txn " + i}
            />
        ];
        // console.log(i, ". to: ", self.state.c_Txns[i]['data']);
        // console.log(i, ". desc: ", self.state.c_Txns[i]['desc']);
      }
      self.setState({ txns_loaded: true });
    }

    fetchContractData();
  }
  // );

  render() {
    const { ethereum } = window;
    // const checkWalletIsConnected = async () => {
    //   if (!ethereum) {
    //       console.log("Make sure you have Metamask installed!");
    //       return;
    //   } else {
    //       console.log("Wallet exists! We're ready to go!")
    //   }

    //   accounts = await ethereum.request({ method: 'eth_accounts' });

    //   if (accounts.length !== 0) {
    //       const account = accounts[0];
    //       console.log("Found an authorized account: ", account);
    //       setCurrentAccount(account);
    //   } else {
    //       console.log("No authorized account found");
    //   }
    // }

    const connectWalletHandler = async () => {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install Metamask!");
      }

      try {
        this.state.accounts = await ethereum.request({ method: "eth_requestAccounts" });
        console.log("Found an account! Address: ", this.state.accounts[0]);
        this.setState({currentAccount: this.state.accounts[0], accountConnected: true});
      } catch (err) {
        console.log(err);
      }
    };

    const connectWalletButton = () => {
      return (
        <Button
          icon="plus"
          id="test-button-secondary-icon"
          text="Connect Wallet"
          theme="primary"
          type="button"
          onClick={connectWalletHandler}
        />
        //   Connect Wallet
        // </Button>
      );
    };

    const transactionsTable = () => {
      return (
        <Table
          columnsConfig="1fr 2fr 2fr 2fr 2fr"
          data={
            this.state.txns_loaded
              ? this.state.txns_frontend
              : [
                  [
                    <Avatar isRounded theme="image" />,
                    "Loading",
                    "Loading",
                    "Loading",
                    <Icon fill="black" size={32} svg="moreVert" />,
                  ],
                ]
          }
          header={[
            "",
            <span>Transaction Description</span>,
            <span>To:</span>,
            <span>Value</span>,
            <span>Actions</span>,
          ]}
          maxPages={3}
          onPageNumberChanged={function noRefCheck(){}}
          pageSize={5}
        />
      );
    };

    
    return (
      <div className="container">
        <div className="title">
          <h1>Multisig</h1>
        </div>
        <div className="connect">
          {this.state.accountConnected ? <h3>Wallet connected</h3> : connectWalletButton()}
        </div>
        <div className="tab">{transactionsTable()}</div>
      </div>
    );
  }
}

export default App;
