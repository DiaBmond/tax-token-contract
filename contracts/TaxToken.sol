// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TaxToken is ERC20, Ownable {
    uint256 public constant TAX_RATE_BPS = 100;
    address public taxWallet;

    mapping(address => bool) public isExcludedFromTax;

    event TaxCollected(
        address indexed from,
        address indexed toWallet,
        uint256 amount
    );
    event TaxWalletUpdated(
        address indexed oldWallet,
        address indexed newWallet
    );
    event ExcludedFromTaxStatus(address indexed account, bool isExcluded);

    constructor(
        address initialOwner
    ) ERC20("Tax Token", "TAX") Ownable(initialOwner) {
        taxWallet = initialOwner;
        isExcludedFromTax[initialOwner] = true;
        isExcludedFromTax[address(this)] = true;

        _mint(initialOwner, 1000000 * 10 ** decimals());
    }

    function setTaxWallet(address newTaxWallet) external onlyOwner {
        require(
            newTaxWallet != address(0),
            "Tax wallet cannot be zero address"
        );
        address oldWallet = taxWallet;
        taxWallet = newTaxWallet;
        emit TaxWalletUpdated(oldWallet, newTaxWallet);
    }

    function setExcludedFromTax(
        address account,
        bool status
    ) external onlyOwner {
        isExcludedFromTax[account] = status;
        emit ExcludedFromTaxStatus(account, status);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        if (
            from == address(0) ||
            to == address(0) ||
            isExcludedFromTax[from] ||
            isExcludedFromTax[to]
        ) {
            super._update(from, to, value);
            return;
        }

        uint256 taxAmount = (value * TAX_RATE_BPS) / 10000;
        uint256 amountAfterTax = value - taxAmount;

        if (taxAmount > 0) {
            super._update(from, taxWallet, taxAmount);
            emit TaxCollected(from, taxWallet, taxAmount);
        }

        super._update(from, to, amountAfterTax);
    }
}
