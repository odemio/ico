pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./TeamAndAdvisorsAllocation.sol";
import "./ODEMToken.sol";

/**
 * @title ODEM Crowdsale contract - crowdsale contract for the ODEM tokens.
 * @author Gustavo Guimaraes - <gustavo@odem.io>
 */
contract ODEMCrowdsale is FinalizableCrowdsale, Pausable {
    uint256 constant public totalSupply = 245714286e18;
    uint256 constant public totalSupplyCrowdsale = 172000000e18; // 70% for sale during crowdsale
    uint256 constant public presaleSupply = 32000000e18;

    // Company and advisor allocation figures
    uint256 public constant COMPANY_SHARE = 58914286e18;
    uint256 public constant TEAM_ADVISORS_SHARE = 14800000e18;

    uint256 public presaleEndTime;

    TeamAndAdvisorsAllocation public teamAndAdvisorsAllocation;

    // for kyc/aml purposes
    /*modifier whenVerified() {
        assert(register.certified(msg.sender));
        _;
    }*/

    /**
     * @dev Contract constructor function
     * @param _startTime The timestamp of the beginning of the crowdsale
     * @param _endTime Timestamp when the crowdsale will finish
     * @param _rate The token rate per ETH
     * @param _wallet Multisig wallet that will hold the crowdsale funds.
     */
    function ODEMCrowdsale
        (
            uint256 _startTime,
            uint256 _presaleEndTime,
            uint256 _endTime,
            uint256 _rate,
            address _wallet
        )
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
     * @dev payable function that allow token purchases
     * @param beneficiary Address of the purchaser
     */
    function buyTokens(address beneficiary)
        public
        whenNotPaused
        /*whenVerified*/
        payable
    {
        require(beneficiary != address(0));
        require(validPurchase() && token.totalSupply() <= totalSupplyCrowdsale);

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
        teamAndAdvisorsAllocation = new TeamAndAdvisorsAllocation(owner, token);
        token.mint(wallet, COMPANY_SHARE);
        token.mint(teamAndAdvisorsAllocation, TEAM_ADVISORS_SHARE);

        if (token.totalSupply() < totalSupplyCrowdsale) {
            uint256 remainingTokens = totalSupplyCrowdsale.sub(totalSupply);

            token.mint(wallet, remainingTokens);
        }

        ODEMToken(token).unpause();

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
