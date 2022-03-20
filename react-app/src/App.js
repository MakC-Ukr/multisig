import "./App.css";
// import {button} from 'react';
import React from "react";
import { useEffect, useState } from "react";
import Web3 from "web3";
import multisig from "./multisig";
import {
  Table,
  CryptoLogos,
  ConnectButton,
  Button,
  Tag,
  Icon,
} from "web3uikit";
import { render } from "@testing-library/react";
import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css";
import { Form, FormInput, FormGroup, FormTextarea } from "shards-react";
import { BigNumber } from "ethers";
import { sign } from "crypto";

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
      // currentAccount: "",
      accountConnected: false,
      accounts: [],
      inputDesc: "",
      inputVal: 0,
      inputData: "",
      inputTo: "",
      saved_signs:[],
      qtySaved_signs: 0,
      partnerAddresses :[],
      partnerWalletConnected: false,
      minVotes: 0,
      executableTxns: [],
      executableTxnsBOOL: false,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  // const temp = this;

  componentDidMount() {
    // <button onClick={signMessage}>Sign Message</button>
    // var BN = web3.utils.BN;
    let x = BigNumber.from("1000000000000000000");
    console.log(x.toString());
    // let y = x.multipliedBy(BigNumber.from(1000000000));
    // let z = y.multipliedBy(0.1).toString();
    // console.log(z);
    var self = this;
    async function fetchContractData() {
      var minVotesNeeded = await multisig.methods.minVotes().call();
      var c_qtyTxn = await multisig.methods.qtyTxn().call();
      // console.log("c_qtyTxn: ", c_qtyTxn);
      for (var i = 0; i < c_qtyTxn; i++) {
        self.state.saved_signs.push({});
        self.state.qtySaved_signs = self.state.qtySaved_signs+1;
        self.state.c_Txns[i] = await multisig.methods.txns(i).call();
        self.state.txns_frontend[i] = [
          <CryptoLogos
            chain="ethereum"
            onClick={function noRefCheck() {}}
            size="48px"
          />,
          self.state.c_Txns[i]["desc"],
          self.state.c_Txns[i]["to"],
          self.state.c_Txns[i]["val"],
          <Button
            onClick={async (e) => {
                  await checkWalletIsConnected();
                  if(self.state.partnerWalletConnected)
                  {
                    try
                    {
                      // console.log(e.target);
                      var txt = e.target.innerText;
                      var txn_index = txt.slice(12, txt.length);
                      // console.log("I = ", txt.slice(12,txt.length));
                      const temp_data =
                        self.state.c_Txns[txt.slice(12, txt.length)]["data"];
                      const temp_to =
                        self.state.c_Txns[txt.slice(12, txt.length)]["to"];
                      const temp_val =
                        self.state.c_Txns[txt.slice(12, txt.length)]["val"];
                      const message = web3.eth.abi.encodeParameters(
                        ['address', 'uint256','bytes'],
                        [temp_to, temp_val, temp_data]
                      );
                      // const message = /*temp_to + temp_val +*/ temp_data;
                      console.log({message});
                      const hashedMessage = web3.utils.sha3(message);
                      console.log({hashedMessage});
                      let accs = await window.ethereum.request({ method: 'eth_accounts' });
                      const signature = await window.ethereum.request({
                        method: "personal_sign",
                        params: [hashedMessage, accs[0]],
                      });
                      // console.log({ signature });
                      const r = signature.slice(0, 66);
                      const s = "0x" + signature.slice(66, 130);
                      const v = parseInt(signature.slice(130, 132), 16);
                      self.state.saved_signs[txn_index][accs[0]] = signature;
                      self.setState();
                      // console.log("Added signature: ", signature, " signed by ", accs[0], " to txn_index: ", txn_index);
                      // console.log("Saved_signs is now : ", self.state.saved_signs);
                      // console.log({ r, s, v });
                    }
                    catch(err)
                    {
                      console.log(err);
                    }
                  }
                  else
                  {
                    console.log("Sorry. Non-partner cannot approve transactions.");
                  }
              }
            }
            text={"Approve txn " + i}
          />,
        ];
      }

      var c_qtyPartners = await multisig.methods.n_partners().call();
      for(var q = 0 ; q < c_qtyPartners; q++)
      {
        var _addr = await multisig.methods.partners(q).call();
        self.state.partnerAddresses.push(_addr);
      }
      
      // console.log("Partners loaded: ", self.state.partnerAddresses);

      self.setState({ txns_loaded: true, minVotes: minVotesNeeded });

    }

    const checkWalletIsConnected = async () => {
      if (!window.ethereum) {
          console.log("Make sure you have Metamask installed!");
          return;
      } else {
          // console.log("Wallet exists! We're ready to go!")
      }

      let accounts = await window.ethereum.request({ method: 'eth_accounts' });

      var partnerConn = await multisig.methods.isPartner(accounts[0]).call();

      if (accounts.length !== 0) {
        this.setState({
          partnerWalletConnected: partnerConn,
          // currentAccount: this.state.accounts[0],
          accountConnected: true,
        });
      } else {
          console.log("No authorized account found");
      }
    }

    
  
    // checkIfTxnsCanBeExec();
    checkWalletIsConnected();
    fetchContractData();
  }



  


  render() {
    const connectWalletHandler = async () => {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install Metamask!");
      }

      try {
        this.state.accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Found an account! Address: ", this.state.accounts[0]);
        this.setState({
          // currentAccount: this.state.accounts[0],
          accountConnected: true,
        });
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
                    <CryptoLogos
                      chain="ethereum"
                      onClick={function noRefCheck() {}}
                      size="1px"
                    />,
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
          onPageNumberChanged={function noRefCheck() {}}
          pageSize={5}
        />
      );
    };

    const checkWalletIsConnected = async () => {  // IMPORTANT NOTE: THIS FUNCTION IS DUPLICATED ABOVE AS WELL. SO ANY CHANGES MUST BE DONE twice.
      if (!window.ethereum) {
          console.log("Make sure you have Metamask installed!");
          return;
      } else {
          // console.log("Wallet exists! We're ready to go!")
      }

      let accounts = await window.ethereum.request({ method: 'eth_accounts' });

      var partnerConn = await multisig.methods.isPartner(accounts[0]).call();

      if (accounts.length !== 0) {
        this.setState({
          partnerWalletConnected: partnerConn,
          // currentAccount: this.state.accounts[0],
          accountConnected: true,
        });
      } else {
          console.log("No authorized account found");
      }
    }


    const handleChangeTo = (event) => {
      this.setState({ inputTo: event.target.value });
    };

    const handleChangeVal = (event) => {
      this.setState({ inputVal: event.target.value });
    };

    const handleChangeData = (event) => {
      this.setState({ inputData: event.target.value });
    };

    const handleChangeDesc = (event) => {
      this.setState({ inputDesc: event.target.value });
    };

    const handleSubmit = async (event) => {
      console.log(
        this.state.inputData,
        this.state.inputDesc,
        this.state.inputTo,
        this.state.inputVal
      );
      await checkWalletIsConnected();
      if(this.state.partnerWalletConnected)
      {
        try {
          let x = BigNumber.from("1000000000000");
          let multiplier = 1000000 * this.state.inputVal; // convert fractional eth value to non-fraction by multiplying by 10^6 so that in can be read by BN.
          let y = x.mul(multiplier);
          let accs = await window.ethereum.request({ method: 'eth_accounts' });
          await multisig.methods
            .addTransaction(
              this.state.inputTo,
              y,
              this.state.inputData,
              this.state.inputDesc
            )
            .send({
              gas: "3000000",
              from: accs[0],
            });
          console.log("Transaction added");
        } catch (err) {
          console.log("Error in submitting : ", err);
          this.setState({
            inputDesc: "",
            inputVal: 0,
            inputData: "",
            inputTo: "",
          });
        }
      }
      else
      {
        console.log("Sorry. Non-partner cannot add transactions.");
      }
      event.preventDefault();
    };

    const addTxnForm = () => {
      return (<Form>
        <FormGroup>
          <label htmlFor="#to">To:</label>
          <FormInput
            id="#to"
            placeholder="Address: 0x....92"
            value={this.state.inputTo}
            onChange={handleChangeTo}
          />
        </FormGroup>
        <FormGroup>
          <label htmlFor="#val">Value in Eth</label>
          <FormInput
            id="#val"
            placeholder="1.5"
            value={this.state.inputVal}
            onChange={handleChangeVal}
          />
        </FormGroup>
        <FormGroup>
          <label htmlFor="#data">Txn Hash</label>
          <FormInput
            id="#data"
            placeholder="0x...0002"
            value={this.state.inputData}
            onChange={handleChangeData}
          />
        </FormGroup>
        
        <FormGroup>
          <label htmlFor="#desc">Txn Description </label>
          <FormInput
            id="#desc"
            placeholder="1Inch Eth->Dai swap"
            value={this.state.inputDesc}
            onChange={handleChangeDesc}
          />
        </FormGroup>
        <div>
          <Button
            id="test-button-colored-yellow"
            onClick={handleSubmit}
            text="Add Txn"
            theme="colored"
            color="yellow"
            type="button"
          />
        </div>
        </Form>);
    }

    const checkIfTxnsCanBeExec = async () => {
      // console.log(this.state.executableTxns);
      for(var ch = 0 ; ch < this.state.c_Txns.length; ch++)
      {
        if(Object.keys(this.state.saved_signs[ch]).length >= this.state.minVotes)
        {
          // console.log("saved_signs[ch].length >= minVotes: ", Object.keys(this.state.saved_signs[ch]).length, ">=", this.state.minVotes);
          this.state.executableTxns.push(
            [
              "Txn " + ch.toString(),
              "",
              <Button text={"Execute Txn "+ch.toString()} onClick={
                async (e)=>{
                  let accs = await window.ethereum.request({ method: 'eth_accounts' });
                  checkWalletIsConnected();

                  var txt = e.target.innerText;
                  var txn_index = txt.slice(12, txt.length);
                  console.log("Txn_index", txn_index);
                  const _v = [];
                  const _r = [];
                  const _s = [];

                  for(var c = 0 ; c < Object.keys(this.state.saved_signs[txn_index]).length; c++)
                  {
                    // console.log("Entered");
                    var key1= Object.keys(this.state.saved_signs[txn_index])[c];
                    const signature = this.state.saved_signs[txn_index][key1];
                    // console.log("Parsing through signatures ", signature);
                    const r = signature.slice(0, 66);
                    const s = "0x" + signature.slice(66, 130);
                    const v = parseInt(signature.slice(130, 132), 16);
                    // console.log({v,r,s});
                    _v.push(v);
                    _r.push(r);
                    _s.push(s);
                  }
                  // console.log({c});
                  console.log({accs});
                  await multisig.methods.executeTransaction(
                    txn_index,
                    _v,
                    _r,
                    _s,
                    c
                  ).send({
                    gas: 3000000,
                    from: accs[0],
                  });
                  this.componentDidMount(); // to remove txm from table
                  checkIfTxnsCanBeExec();
                }
              }/>
            ]
          )
        }
        // console.log(this.state.executableTxns);
        this.setState({
          executableTxnsBOOL : true
        }
        );
      }
    }

    const executeTxns = ()=>{
      return (
        <Table
          columnsConfig="2fr 1fr 2fr"
          data={
            this.state.executableTxnsBOOL
              ? this.state.executableTxns
              : [
                ["", "", ""]
              ]
          }
          header={[
            <span>Txn ID</span>,
            <span></span>,
            <span>Action</span>,
          ]}
          maxPages={3}
          onPageNumberChanged={function noRefCheck() {}}
          pageSize={5}
        />
      );
    }

    return (
      <div className="container">
        <div className="title">
          <h1>Multisig</h1>
        </div>
        <div className="connect">
          {this.state.accountConnected ? (
            <h3>{this.state.partnerWalletConnected ? "Partner" : "Non-partner" } Wallet connected</h3>
          ) : (
            connectWalletButton()
          )}
        </div>
        <div className="tab">{transactionsTable()}</div>
        <div className="formArea">{addTxnForm()}</div>
        <div className="exec flex-container">
          <div>
            <h4>Txns that can be executed    .................................    -</h4>
            <Button onClick={checkIfTxnsCanBeExec} text="Check Now"/>
          </div>
          {/* <h4>.............</h4> */}
          {executeTxns()}
          </div>
        <div className="textExplain">
        <h3>How to use the multisig ?</h3>
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        </div>
      </div>
    );
  }
}

export default App;
