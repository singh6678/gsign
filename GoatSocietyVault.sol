// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
/**
 * => Vault contract ......
 * @title Goat Society Vault
 * -> Play the game => earned 200 points 
 ---------------------------------
 * goatsociety.com/redeem
 ---------------------------------
 * -> 200 point => 100 points
 * user click redeem => hits api to the backend server => contains the validator 'private key.
 * <USER_ETH_PUBLIC_ADDRESS>, <100 TOKENS> => given to the centalized server 
 * Validator key signs ====> [<USER_ETH_PUBLIC_ADDRESS>, <100 TOKENS>] => given to the user <signature + nonce>
 * 
 * You'll receive a popup to sign the tx which contains all these above details...
 * 
 */
contract GoatSocietyVault is ReentrancyGuard {
    using ECDSA for bytes32;
    address public validator;
    IERC20 public goatToken;
    mapping(bytes => bool) private _proofs;
    constructor(address _goatToken) {
        validator = msg.sender;
        goatToken = IERC20(_goatToken);
    }
    function redemWithPermit(
        address recipient,
        uint256 redemAmount,
        bytes memory sig,
        uint256 nonce
    ) external nonReentrant {
        bytes32 hash = keccak256(
            abi.encodePacked(recipient, redemAmount, nonce)
        );
        bytes32 _message = ECDSA.toEthSignedMessageHash(hash);
        address _signer = ECDSA.recover(_message, sig);
        require(_signer == validator, "Not a valid signature!");
        _proofs[sig] = true;
        require(
            goatToken.balanceOf(address(this)) >= redemAmount,
            "Insifficient amount in vault!"
        );
        goatToken.transfer(recipient, redemAmount);
    }
}
