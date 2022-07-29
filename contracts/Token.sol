// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@rari-capital/solmate/src/tokens/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("MyToken", "MTK", 18) {
        _mint(msg.sender, 100000000 * 10**18);
    }
}