pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/token/PausableToken.sol";
import "zeppelin-solidity/contracts/token/BurnableToken.sol";

/**
 * @title ODEM Token contract - ERC20 compatible token contract.
 * @author Gustavo Guimaraes - <gustavo@odem.io>
 */
contract ODEMToken is BurnableToken, PausableToken, MintableToken {
    string public constant name = "ODEM Token";
    string public constant symbol = "ODEM";
    uint8 public constant decimals = 18;

    /**
     * @dev makes a number token unused forever
     * @param _value Number of tokens to burn
     */
    function burn(uint256 _value) public {
        super.burn(_value);
    }
}
