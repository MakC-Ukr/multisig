# Multisig

A simple multisig wallet that allows multiple accoutns to sign transactions and stores this data off-chain. Once enough votes are received (the threshold is defined in the smart contract), any partner of the multisig can execute the transaction on-chain. 

The project has a usable website UI, proper error handling and gas optimised smart contract. It is assumed in the Solidity code that the number of partners will be small (in single or double digits) for gas optimisation purposes. 

#### To test it out: 
1. Clone the repo from GitHub
2. Open "react-app" directory
3. Run "npm install" command in Terminal
4. Run "npm start" command in Terminal.

However, note that for testing you will have to deploy a new smart contract where you are the owner and can make other wallets partners. Otherwise, contact the owner to make you a partner in the smart contract.

###### Contract address: 0x53ac59368fde73A45dEa3f9ccEB3fd4563DEC20e 

#### Terminology
Partner: those wallets whose signs are needed for execution
Owner:: the single wallet which deployed the contract (0x318Edb8407bc022556989429EAC679F1e4001B5c)