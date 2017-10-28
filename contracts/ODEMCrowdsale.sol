pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./ODEMToken.sol";

/**
 * @title ODEM Crowdsale contract - crowdsale contract for the APA tokens.
 * @author Gustavo Guimaraes - <gustavo@odem.io>
 */
contract ODEMCrowdsale is CappedCrowdsale, FinalizableCrowdsale, Pausable {
    uint256 constant public totalSupply = 245714286e18;
    uint256 constant public totalSupplyCrowdsale = 172000000e18; // 70% for sale during crowdsale
    uint256 constant public presaleSupply = 32000000e18; // 700K
    uint256 public constant ALLOCATION_SHARE = 73714286e18; // 30 %
    uint256 public presaleEndTime;

    /**
     * @dev Contract constructor function
     * @param _startTime The timestamp of the beginning of the crowdsale
     * @param _endTime Timestamp when the crowdsale will finish
     * @param _rate The token rate per ETH
     * @param _cap Crowdsale cap
     * @param _wallet Multisig wallet that will hold the crowdsale funds.
     */
    function ODEMCrowdsale
        (
            uint256 _startTime,
            uint256 _presaleEndTime,
            uint256 _endTime,
            uint256 _rate,
            uint256 _cap,
            address _wallet
        )
        CappedCrowdsale(_cap)
        FinalizableCrowdsale()
        Crowdsale(_startTime, _endTime, _rate, _wallet)
    {
        presaleEndTime = _presaleEndTime;
        ODEMToken(token).pause();
    }

    /**
     * @dev Creates ODEM token contract. This is called on the constructor function of the Crowdsale contract
     */
    function createTokenContract() internal returns (MintableToken) {
        return new ODEMToken();
    }

    /**
     * @dev triggers token transfer mechanism. To be used after the crowdsale is finished
     */
    function unpauseToken() onlyOwner {
        require(isFinalized);
        ODEMToken(token).unpause();
    }

    /**
     * @dev Pauses token transfers. Only used after crowdsale finishes
     */
    function pauseToken() onlyOwner {
        require(isFinalized);
        ODEMToken(token).pause();
    }

    /**
     * @dev payable function that allow token purchases
     * @param beneficiary Address of the purchaser
     */
    function buyTokens(address beneficiary)
        public
        whenNotPaused
        payable
    {
        require(beneficiary != address(0));
        require(validPurchase());

        if (now >= startTime && now <= presaleEndTime)
            require(checkPreSaleCap());

        uint256 weiAmount = msg.value;
        uint256 bonus = getBonusTier();

        // calculate token amount to be created
        uint256 tokens = weiAmount.mul(rate);

        if (bonus > 0) {
            uint256 tokensIncludingBonus = tokens.mul(bonus).div(100);

            tokens = tokens.add(tokensIncludingBonus);
        }

        // update state
        weiRaised = weiRaised.add(weiAmount);

        token.mint(beneficiary, tokens);

        TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

        forwardFunds();
    }

    /**
     * @dev finalizes crowdsale
     */
    function finalization() internal {
       token.mint(wallet, ALLOCATION_SHARE);

       super.finalization();
    }

    /**
     * @dev checks whether it is pre sale and if there is minimum purchase requirement
     * @return truthy if token total supply is less than presaleSupply
     */
     function checkPreSaleCap() internal returns (bool) {
        return token.totalSupply() <= presaleSupply;
     }

     /**
     * @dev Fetches Bonus tier percentage per bonus milestones
     * @return uint256 representing percentage of the bonus tier
     */
    function getBonusTier() internal returns (uint256) {
        bool preSalePeriod = now >= startTime && now <= presaleEndTime; //  50% bonus
        bool crowdsalePeriod = now > presaleEndTime; // 0% bonus

        if (preSalePeriod) return 25;
        if (crowdsalePeriod) return 0;
    }
}
