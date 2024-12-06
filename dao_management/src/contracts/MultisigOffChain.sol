// SPDX-License-Identifier: UNLICENSED



pragma solidity ^0.8.27;

contract Multisig {

    // словарь админов
    mapping(address => bool) public admins;
    // количество админов
    uint256 adminsCount;
    uint256 public _nonce;

    event Verify(bool success);
    constructor(address[] memory _admins){
        adminsCount = _admins.length;
        for(uint256 i = 0; i < adminsCount; i++){
            admins[_admins[i]] = true;
        }
    }

    function verify(
        uint256 nonce,
        address targetContract,
        bytes calldata payload,
        uint8[] calldata v,
        bytes32[] calldata r,
        bytes32[] calldata s
    )
        public 
        payable
    {
        // nonce check
        require(_nonce == nonce, "Bad nonce");
        

        // arrays length check
        require(v.length == r.length && r.length == s.length, "Bad arrays length");

        // getting hash message from source data
        bytes32 messagehash = getMessageHash(nonce, targetContract, payload);
        _nonce++;

        // getting amount of correct signatures
        uint256 signersAmount = _verify(messagehash, v, r, s);

        // checking how many admins signed the message 
        require(signersAmount > adminsCount / 2, "Too few signers");
        
        // now we can do low call 
        bool success = lowLevelCall(targetContract, payload, msg.value);

        emit Verify(success);
    }

    // getting hash message from source data using function
    function getMessageHash(
        uint256 nonce,
        address targetContract,
        bytes calldata payload
    )
    internal 
    view
    returns(bytes32)
    {
        bytes memory message = abi.encodePacked(nonce, address(this), targetContract, payload);
        bytes memory prefix = "\x19Ethereum Signed Message:\n";
        bytes memory digest = abi.encodePacked(prefix, toBytes(message.length), message);
        return keccak256(digest);
    }

    function toBytes(uint256 number) internal pure returns(bytes memory){
        uint256 temp = number;
        uint256 digits = 0;
        do {
            temp /= 10;
            digits++;
        } while (temp != 0);
        bytes memory buffer = new bytes(digits);
        while(number != 0){
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(number % 10)));
            number /= 10;
        }
        return buffer;
    }

     function _verify(
        bytes32 hash,
        uint8[] calldata v,
        bytes32[] calldata r,
        bytes32[] calldata s
    )
    internal 
    view 
    returns(uint256)
    {
        // Amount of admins that signed the message
        uint256 signed;

        // Array of admins that signed this message
        address[] memory adrs = new address[](v.length);
        for(uint256 i = 0; i < v.length; i++){
            address adr = ecrecover(hash, v[i], r[i], s[i]);

            //checking if this address is Admin
            if(admins[adr]){
                bool check = true;
                // checkhing in the cycle
                // if address already signed than skip
                // if not than adding decoded address to adrs array and increasing signed variable
                for(uint256 j = 0; j < signed; j++){
                    if(adrs[j] == adr){
                        check = false;
                        break;
                    }
                    if(check){
                        adrs[signed] = adr;
                        signed++;
                    }
                }
            }
        }
        return signed;  
    }

    function lowLevelCall(address targetContract, bytes calldata payload, uint256 _value)internal returns(bool){
        (bool success, )  = targetContract.call{value: _value}(payload);
        require(success, "Fail");
        return success;
    }
}

// [0x5B38Da6a701c568545dCfcB03FcB875f56beddC4, 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2, 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db, 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB]