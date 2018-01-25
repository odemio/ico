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
    uint256 constant public INVESTORS_OWNERS_1_SHARE = 15000000e18;
    uint256 constant public INVESTORS_OWNERS_2_SHARE = 49000000e18;
    uint256 constant public COMPANY_SHARE = INVESTORS_OWNERS_1_SHARE.add(INVESTORS_OWNERS_2_SHARE);

    uint256 constant public PRE_CROWDSALE_CAP = 58200000e18;
    uint256 constant public TOTAL_TOKENS_BEFORE_CROWDSALE = COMPANY_SHARE.add(PRE_CROWDSALE_CAP);

    uint256 constant public TOTAL_TOKENS_CROWDSALE = 180000000e18;
    uint256 constant public TOTAL_TOKENS_AFTER_CROWDSALE = TOTAL_TOKENS_BEFORE_CROWDSALE.add(TOTAL_TOKENS_CROWDSALE);

    uint256 constant public TEAM_ADVISORS_SHARE = 23800000e18;

    uint256 constant public TOTAL_TOKENS_SUPPLY = 397000000e18;

    // external contracts
    Whitelist public whitelist;
    TeamAndAdvisorsAllocation public teamAndAdvisorsAllocation;

    event PrivateInvestorTokenPurchase(address indexed investor, uint256 rate, uint weiAmount);

    /**
     * @dev Contract constructor function
     * @param _startTime The timestamp of the beginning of the crowdsale
     * @param _endTime Timestamp when the crowdsale will finish
     * @param _whitelist contract containing the whitelisted addresses
     * @param _rate The token rate per ETH
     * @param _wallet Multisig wallet that will hold the crowdsale funds.
     * @param _wallet2 wallet that will hold tokens from the company share.
     * @param _wallet3 wallet that will hold tokens from the company share.
     */
    function ODEMCrowdsale
        (
            uint256 _startTime,
            uint256 _endTime,
            uint256 _whitelist,
            uint256 _rate,
            address _wallet,
            address _wallet2,
            address _wallet3
        )
        public
        FinalizableCrowdsale()
        Crowdsale(_startTime, _endTime, _rate, _wallet)
    {

        whitelist = Whitelist(_whitelist);

        token.mint(_wallet2, INVESTORS_OWNERS_1_SHARE);
        token.mint(_wallet3, INVESTORS_OWNERS_2_SHARE);
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
    function mintTokenForPreCrowdsale(address investorsAddress, uint256 rate, uint256 weiAmount)
        external
        onlyOwner
    {
        require(now < startTime);
        require(token.totalSupply() <= TOTAL_TOKENS_BEFORE_CROWDSALE);

        uint256 tokens = rate.mul(weiAmount);

        token.mint(investorsAddress, tokens);
        PrivateInvestorTokenPurchase(investorsAddress, rate, weiAmount);
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
        require(validPurchase() && token.totalSupply() <= TOTAL_TOKENS_AFTER_CROWDSALE);

        uint256 weiAmount = msg.value;

        // calculate token amount to be created
        uint256 tokens = weiAmount.mul(rate);

        // update state
        weiRaised = weiRaised.add(weiAmount);

        //remainder logic
        if (tokens.add(token.tokenSupply()) > TOTAL_TOKENS_AFTER_CROWDSALE) {
            uint256 tokenDifference = token.tokenSupply().sub(TOTAL_TOKENS_AFTER_CROWDSALE);
            tokens = TOTAL_SUPPLY_CROWDSALE.sub(token.tokenSupply());
            uint256 weiAmountToReturn = tokenDifference.div(rate);

            weiRaised.sub(weiAmount);
            msg.sender.tranfer(weiAmountToReturn);
        }

        token.mint(beneficiary, tokens);

        TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

        forwardFunds();
    }

    // overriding Crowdsale#hasEnded to add cap logic
    // @return true if crowdsale event has ended
    function hasEnded() public view returns (bool) {
        if (token.totalSupply() == TOTAL_TOKENS_AFTER_CROWDSALE) {
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
        token.mint(teamAndAdvisorsAllocation, TEAM_ADVISORS_SHARE);

        uint256 remainingTokens = TOTAL_TOKENS_SUPPLY.sub(token.totalSupply());

        token.mint(wallet, remainingTokens);

        token.finishMinting();
        ODEMToken(token).unpause();
        super.finalization();
    }
}
