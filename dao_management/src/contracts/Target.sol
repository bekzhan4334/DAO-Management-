// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.27;

contract Target {
    address public owner;

    event sentFunds(address adr, uint256 value);
    constructor(address _owner){
            owner = _owner;
    }

        
    function sendFunds(address receiver) public payable {
        require(msg.value > 0, "Must send funds!");
        payable(receiver).transfer(msg.value);
        emit sentFunds(receiver, msg.value);
    }
}