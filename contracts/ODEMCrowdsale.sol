pragma solidity 0.4.18;

import "zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./TeamAndAdvisorsAllocation.sol";
import "./ODEMToken.sol";
import "./Whitelist.sol";

/**
 * @title ODEM Crowdsale contract - crowdsale contract for the ODEM tokens.
 * @author Gustavo Guimaraes - <gustavo@odem.io>
 */

contract ODEMCrowdsale is FinalizableCrowdsale, Pausable {
    uint256 constant public TOTAL_TOKEN_SUPPLY = 245714286e18;
    uint256 constant public TOKEN_SUPPLY_CROWDSALE = 172000000e18; // 70% for sale during crowdsale

    // Company and advisor allocation figures
    uint256 public constant COMPANY_SHARE = 58914286e18;
    uint256 public constant TEAM_ADVISORS_SHARE = 14800000e18;

    // external contracts
    Whitelist public whitelist;
    TeamAndAdvisorsAllocation public teamAndAdvisorsAllocation;

    event PrivateInvestorTokenPurchase(address indexed investor, uint256 rate, uint256 bonus, uint weiAmount);

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
            uint256 _endTime,
            uint256 _whitelist,
            uint256 _rate,
            address _wallet
        )
        public
        FinalizableCrowdsale()
        Crowdsale(_startTime, _endTime, _rate, _wallet)
    {

        whitelist = Whitelist(_whitelist);
        ODEMToken(token).pause();
    }

    modifier whitelisted(address beneficiary) {
        require(whitelist.isWhitelisted(beneficiary));
        _;
    }

    /**
     * @dev change crowdsale rate
     * @param newRate Figure that corresponds to the new rate per token
     */
    function setRate(uint256 newRate) external onlyOwner {
        require(newRate != 0);
        rate = newRate;
    }

    /**
     * @dev Mint tokens for private investors before crowdsale starts
     * @param investorsAddress Purchaser's address
     * @param rate Rate of the purchase
     * @param bonus Number that represents the bonus
     * @param weiAmount Amount that the investors sent during the private sale period
     */
    function mintTokenForPrivateInvestors(address investorsAddress, uint256 rate, uint256 bonus, uint256 weiAmount)
        external
        onlyOwner
    {
        uint256 tokens = rate.mul(weiAmount);
        uint256 tokenBonus = tokens.mul(bonus).div(100);
        tokens = tokens.add(tokenBonus);

        token.mint(investorsAddress, tokens);
        PrivateInvestorTokenPurchase(investorsAddress, rate, bonus, weiAmount);
    }

    /**
     * @dev payable function that allow token purchases
     * @param beneficiary Address of the purchaser
     */
    function buyTokens(address beneficiary)
        public
        whenNotPaused
        whitelisted(beneficiary)
        payable
    {
        require(beneficiary != address(0));
        require(validPurchase() && token.totalSupply() <= TOKEN_SUPPLY_CROWDSALE);

        uint256 weiAmount = msg.value;

        // calculate token amount to be created
        uint256 tokens = weiAmount.mul(rate);

        // update state
        weiRaised = weiRaised.add(weiAmount);

        token.mint(beneficiary, tokens);

        TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

        forwardFunds();
    }

    // overriding Crowdsale#hasEnded to add cap logic
    // @return true if crowdsale event has ended
    function hasEnded() public view returns (bool) {
        if (token.totalSupply() >= TOKEN_SUPPLY_CROWDSALE) {
            return true;
        }

        return super.hasEnded();
    }

    /**
     * @dev Creates ODEM token contract. This is called on the constructor function of the Crowdsale contract
     */
    function createTokenContract() internal returns (MintableToken) {
        return new ODEMToken();
    }

    /**
     * @dev finalizes crowdsale
     */
    function finalization() internal {
        teamAndAdvisorsAllocation = new TeamAndAdvisorsAllocation(owner, token);
        token.mint(wallet, COMPANY_SHARE);
        token.mint(teamAndAdvisorsAllocation, TEAM_ADVISORS_SHARE);

        if (token.totalSupply() < TOKEN_SUPPLY_CROWDSALE) {
            uint256 remainingTokens = TOKEN_SUPPLY_CROWDSALE.sub(TOTAL_TOKEN_SUPPLY);

            token.mint(wallet, remainingTokens);
        }

        token.finishMinting();
        ODEMToken(token).unpause();
        super.finalization();
    }
}
