// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TaxToken is ERC20, Ownable {
    uint256 public constant TAX_RATE_BPS = 100;

    constructor(
        address initialOwner
    ) ERC20("Tax Token", "TAX") Ownable(initialOwner) {
        _mint(initialOwner, 1000000 * 10 ** decimals());
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        if (
            from == address(0) ||
            to == address(0) ||
            from == owner() ||
            to == owner()
        ) {
            super._update(from, to, value);
            return;
        }
        uint256 taxAmount = (value * TAX_RATE_BPS) / 10000;
        uint256 amountAfterTax = value - taxAmount;

        if (taxAmount > 0) {
            super._update(from, owner(), taxAmount);
        }

        super._update(from, to, amountAfterTax);
    }
}
