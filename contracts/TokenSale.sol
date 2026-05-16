// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

contract TokenSale is Context, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 private immutable token;
    address payable private immutable wallet;

    uint256 private rate;
    uint256 private weiReceived;

    event TokensPurchased(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );

    constructor(uint256 _rate, address payable _wallet, address _token) {
        require(_rate > 0, "TokenSale: rate is 0");
        require(_wallet != address(0), "TokenSale: wallet is the zero address");
        require(_token != address(0), "TokenSale: token is the zero address");

        rate = _rate;
        wallet = _wallet;
        token = IERC20(_token);
    }

    function getToken() public view returns (IERC20) {
        return token;
    }

    function getWallet() public view returns (address payable) {
        return wallet;
    }

    function getRate() public view returns (uint256) {
        return rate;
    }

    function getWeiReceived() public view returns (uint256) {
        return weiReceived;
    }

    function buyTokens(address beneficiary) public payable nonReentrant {
        uint256 weiAmount = msg.value;
        _preValidatePurchase(beneficiary, weiAmount);

        uint256 tokens = _getTokenAmount(weiAmount);

        weiReceived = weiReceived + weiAmount;

        _processPurchase(beneficiary, tokens);

        emit TokensPurchased(_msgSender(), beneficiary, weiAmount, tokens);

        _updatePurchasingState(beneficiary, weiAmount);

        _forwardFunds();
        _postValidatePurchase(beneficiary, weiAmount);
    }

    function _preValidatePurchase(
        address beneficiary,
        uint256 weiAmount
    ) internal view virtual {
        require(
            beneficiary != address(0),
            "TokenSale: beneficiary is the zero address"
        );
        require(weiAmount != 0, "TokenSale: weiAmount is 0");
    }

    function _postValidatePurchase(
        address beneficiary,
        uint256 weiAmount
    ) internal view virtual {}

    function _deliverTokens(
        address beneficiary,
        uint256 tokenAmount
    ) internal virtual {
        token.safeTransferFrom(wallet, beneficiary, tokenAmount);
    }

    function _processPurchase(
        address beneficiary,
        uint256 tokenAmount
    ) internal virtual {
        _deliverTokens(beneficiary, tokenAmount);
    }

    function _updatePurchasingState(
        address beneficiary,
        uint256 weiAmount
    ) internal virtual {}

    function _getTokenAmount(
        uint256 weiAmount
    ) internal view virtual returns (uint256) {
        return weiAmount * rate;
    }

    function _forwardFunds() internal {
        (bool success, ) = wallet.call{value: msg.value}("");
        require(success, "TokenSale: ETH transfer failed");
    }

    receive() external payable {
        buyTokens(_msgSender());
    }
}
