// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Verify {

    function VerifyMessage(bytes32 _hashedMessage, uint8 _v, bytes32 _r, bytes32 _s) public pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, _hashedMessage));
        address signer = ecrecover(prefixedHashMessage, _v, _r, _s);
        return signer;
    }

    function sha3converter(string memory z) public pure returns (bytes32)
    {
        return keccak256(abi.encodePacked(z));
    }

}


// 0x452a4288a4f83d5376a46445bc05d0c9c071f9b377289a607cc49288999a755317d559e945fa4879e74e656a181202132013ff3b18c1b6a2a2d2893b27d157121c
0x8291f376bdaa493334ef361215298a2e538972d91bd0c4079a9379734db5b99d,28,0x77a30fcee7e98e4df81a7e3605ac6801d6d96cace29ce514c546c470ad2f2974,0x2c096df473a265dc3f9aa095cf68c84a0ef4753d04e9e3ec26ef87b7761bec4d