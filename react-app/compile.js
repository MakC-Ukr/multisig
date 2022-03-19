const path = require('path');
const fs = require('fs');
const solc = require('solc');

const inboxpath = path.resolve(__dirname, 'contracts', 'Multisig.sol');
const source = fs.readFileSync(inboxpath, 'UTF-8');

var input = {
  language: 'Solidity',
  sources: {
    'Multisig.sol' : {
        content: source
    }
},
settings: {
    outputSelection: {
        '*': {
            '*': [ '*' ]
        }
    }
}
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));

exports.abi = output.contracts['Multisig.sol']['Multisig'].abi;
exports.bytecode = output.contracts['Multisig.sol'] ['Multisig'].evm.bytecode.object;


console.log("ABI");
console.log(JSON.stringify(exports.abi));
console.log("BYTECODE")
console.log(exports.bytecode);