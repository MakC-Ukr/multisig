# Multisig wallet

### What will I be trying to build: 

The plan to start working on this.

1 . Create a smart contract that has the following functions:
      a. Add a transaction by passing to, value and hex-data
      b. Sign a transaction without paying gas (i.e. use private key for signing)
      c. Initiate an approved transaction by passing all the signed messages (which we had stored off-chain when each owner approved it). The txn would involve gas fees obviously, but the smart contract also checks that each of the signs that we pass as parameters is valid (i.e. the user which signed it is an owner). The smart contract checks the same by using "ecrecover".


2. Once we have the smart contract we simply need to make sure the frontend has buttons for these functions. And we store the signed messages in a simple array/hashmap.


##### 18 March

Created a react app to show connect wallet button, and a smart contracy which stores the txns on chain. 

The next steps are to connect the smart contract to out frontend and start reading transactions in order to display them. 


##### 19 March
Added signing functionality to frontend. Connect Wallet button is also present.

i. Proper error handling is missing. An error renders all the buttons to be not clickable. Use notifications for that
ii. A form to add transactions is also missing. 


##### 19 March. Part two.

Approving ytansactions and proposing txns is now possible. Things left to add are:
i. error handling
ii. Executing txns once neccessary amounr of votes is achieved
iii. Storing the signs off-chain (better, on servers)


##### 20 March

Executing transactions is now possible from the website. After execution, the transaction is deleted from the wallet. Sign are stored in state.
i. when adding partners ensure that a partner address is unique (needs to be done in smart contract)
ii. error handling
iii. A lot of gas optimisation for execution function.

##### 20 March. Part two.

Adding the smae partner twice will now result in an error. Most of the user-related errors are shown as pop-up notifications (error handling).

