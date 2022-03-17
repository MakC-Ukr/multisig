# Multisig wallet

### What will I be trying to build: 

The plan to start working on this.

1 . Create a smart contract that has the following functions:
      a. Add a transaction by passing to, value and hex-data
      b. Sign a transaction without paying gas (i.e. use private key for signing)
      c. Initiate an approved transaction by passing all the signed messages (which we had stored off-chain when each owner approved it). The txn would involve gas fees obviously, but the smart contract also checks that each of the signs that we pass as parameters is valid (i.e. the user which signed it is an owner). The smart contract checks the same by using "ecrecover".


2. Once we have the smart contract we simply need to make sure the frontend has buttons for these functions. And we store the signed messages in a simple array/hashmap.