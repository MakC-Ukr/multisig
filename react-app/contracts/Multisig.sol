//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct Transaction 
{
    address to;
    uint val;
    bytes data;
    bool executed;
    string desc;
}

abstract contract Ownable {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(msg.sender);
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    // function renounceOwnership() public virtual onlyOwner {
    //     _transferOwnership(address(0));
    // }

    function transferOwnership(address newOwner) private onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


contract Multisig is Ownable
{
    using SafeMath for uint256;
    Transaction [] public txns;
    uint public qtyTxn;
    address[] public partners;
    uint public n_partners;
    uint public minVotes = 1;
    mapping(address => bool) public alreadySigned;
    address[] public allSigners;

    constructor()
    {
        add_partner(msg.sender);
    }

    function setMinVotes(uint x) public onlyOwner
    {
        minVotes = x;
    }

    function add_partner(address _addr) onlyOwner public
    {
        bool flag = true;
        for(uint i = 0 ; i < partners.length; i++)
        {
            if(partners[i] == _addr)
            {
                flag = false;
            }
        }
        require(flag);

        n_partners = n_partners + 1;
        partners.push(_addr);
    }

    function isPartner(address _addr) public view returns (bool) {
        for(uint i = 0 ; i < n_partners; i++)
        {
            if(partners[i] == _addr)
            {
                return true;
            }
        }
        return false;
    }


    function addTransaction(address _to, uint _val, bytes memory _txhash, string memory _desc) public
    {
        Transaction memory txn = Transaction({
            to: _to,
            val: _val,
            data: _txhash,
            executed: false,
            desc: _desc
        });
        qtyTxn = qtyTxn.add(1);
        txns.push(txn);
    }


    function executeTransaction(uint _index, uint8[] memory _v, bytes32[] memory _r, bytes32[] memory _s, uint len) public 
    {
        require(len >= minVotes, "len must be >= minVotes");
        require(len == _s.length, "len must be = _s.length");
        require(len == _v.length, "len must be = _v.lenght");
        require(len == _r.length, "len must be = _r.length");

        bytes32 _hashedMessage = keccak256(abi.encode(
                txns[_index].to,  txns[_index].val,  txns[_index].data
                ));
        
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, _hashedMessage));

        // address[] memory allSigners;

        for(uint i = 0 ; i < len; i++)
        {
            uint8 v= _v[i];
            bytes32 r = _r[i];
            bytes32 s = _s[i];
            address signer = ecrecover(prefixedHashMessage, v, r, s);
            if(isPartner(signer)){
                allSigners.push(signer);
                if(alreadySigned[signer] == false)       {
                    alreadySigned[signer] = true;
                }
            }
        }
        uint votesCounted = 0;
        for(uint i = 0 ; i < n_partners; i++){
            if(alreadySigned[partners[i]]){
                votesCounted+=1;
            }
        }

        require(votesCounted >= minVotes, "votes not enough");
        Transaction memory txn = txns[_index];
        (bool success, bytes memory data) = txn.to.call{value: txn.val, gas: 3000000}(txn.data);
        require(success, "txn not succesful");

        for(uint i = 0; i < allSigners.length; i++){
            alreadySigned[allSigners[i]] = false;
        }
        removeTxn(_index);
    }

    function getHashedMsg(uint _index) public view returns (bytes32)
    {
        return keccak256(abi.encode(txns[_index].to, txns[_index].val, txns[_index].data));
    }

    function getEncodedMsg(uint _index) public view returns (bytes memory)
    {
        return abi.encode(txns[_index].to, txns[_index].val, txns[_index].data);
    }

    function execEZ(uint _index) public onlyOwner
    {
        Transaction memory txn = txns[_index];
        (bool success, bytes memory data) = txn.to.call{value: txn.val, gas: 3000000}(txn.data);
        require(success, "txn not succesful");
    }

    function removeTxn(uint index) private
    {
        require(txns.length > 0);
        require(txns.length > index);
        qtyTxn--;
        txns[index] = txns[txns.length - 1];
        txns.pop();
    }

    // For sending any ETH to contract
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


// 1m wei to uniswap:   "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", "1000000", "0x5ae401dc000000000000000000000000000000000000000000000000000000006233982c00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000c778417e063141139fce010982780140aa0cd5ab000000000000000000000000c7ad46e0b8a400bb3c915120d284aafba8fc47350000000000000000000000000000000000000000000000000000000000000bb8000000000000000000000000318edb8407bc022556989429eac679f1e4001b5c00000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000025f4e52518411fae5000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","Swapping 1 million wei to DAI on Uniswap"
// transferring 1m wei: "0xC3B9701E27f2f6Eae771C157D09f6999969803B2", "10000000000000000", ""
// TestContract:  "0xCD986A4cdBA18C853f261bb8C0Aa57e370053b6b", "0", "0xe73620c3000000000000000000000000000000000000000000000000000000000000007b","Adding 123 to TestContract"

// "0", [28], ["0x7f57852521fd3949680a162f984520807b864b290cf0d9b57b7ef36aa778c628"],["0x18d516476b3fd314ba5baa0f3b4cf90e2e1bad4820e3702f22f2196353fedbf2"],"1"
//0x318Edb8407bc022556989429EAC679F1e4001B5c