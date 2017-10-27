pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol";
import "./ODEMToken.sol";

/**
 * @title ODEM Crowdsale contract - crowdsale contract for the APA tokens.
 * @author Gustavo Guimaraes - <gustavo@odem.io>
 */
contract ODEMCrowdsale is CappedCrowdsale, FinalizableCrowdsale {
    uint256 constant public totalSupply = 245714286e18;
    uint256 constant public totalSupplyCrowdsale = 172000000e18; // 70% for sale during crowdsale
    uint256 public constant ALLOCATION_SHARE = 73714286e18; // 30 %

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
            uint256 _endTime,
            uint256 _rate,
            uint256 _cap,
            address _wallet
        )
        CappedCrowdsale(_cap)
        FinalizableCrowdsale()
        Crowdsale(_startTime, _endTime, _rate, _wallet)
    {
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
        AllPublicArtToken(token).unpause();
    }

    /**
     * @dev Pauses token transfers. Only used after crowdsale finishes
     */
    function pauseToken() onlyOwner {
        require(isFinalized);
        AllPublicArtToken(token).pause();
    }
}
