//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct Transaction 
{
    address to;
    uint val;
    bytes data;
    bool executed;
}

contract Multisig
{
    using SafeMath for uint256;
    Transaction [] public txns;
    uint public qtyTxn;

    function addTransaction(address _to, uint _val, bytes memory _txhash) public
    {
        Transaction memory txn = Transaction({
            to: _to,
            val: _val,
            data: _txhash,
            executed: false
        });
        qtyTxn = qtyTxn.add(1);
        txns.push(txn);
    }


    function executeTransaction(uint _index) public 
    {
        Transaction memory txn = txns[_index];
        (bool success, bytes memory data) = txn.to.call{value: txn.val, gas: 3000000}(txn.data);
        require(success, "txn not succesful");
    }


    receive() external payable{}
    fallback() external payable{}
}

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

// 1m wei to uniswap:   "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", "1000000", "0x5ae401dc000000000000000000000000000000000000000000000000000000006233982c00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000c778417e063141139fce010982780140aa0cd5ab000000000000000000000000c7ad46e0b8a400bb3c915120d284aafba8fc47350000000000000000000000000000000000000000000000000000000000000bb8000000000000000000000000318edb8407bc022556989429eac679f1e4001b5c00000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000025f4e52518411fae5000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
// trasnferring 1m wei: "0xC3B9701E27f2f6Eae771C157D09f6999969803B2", "10000000000000000", ""