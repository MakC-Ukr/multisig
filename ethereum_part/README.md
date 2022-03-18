
## File explanations

##### Verify.sol
The contract can easily be used to verify the r,v,s values that we go from calling ethereum.request({method: "personal_sign", params: [hashedMessage, accounts[0]],}).

Notice that to the contract we pass the keccak256 value of the string that we sign. 
For e.g. if the message is "This is a signed message", the hash to be passed will be 0x8291f376bdaa493334ef361215298a2e538972d91bd0c4079a9379734db5b99d.

##### TxnTestingContract.sol
This contract can be deployed for testing out basic transaction creation/execution.