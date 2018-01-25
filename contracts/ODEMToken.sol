pragma solidity 0.4.18;

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/token/PausableToken.sol";

/**
 * @title ODEM Token contract - ERC20 compatible token contract.
 * @author Gustavo Guimaraes - <gustavo@odem.io>
 */

contract ODEMToken is PausableToken, MintableToken {
    string public constant name = "ODEM Token";
    string public constant symbol = "ODEM";
    uint8 public constant decimals = 18;

    event Burn(address indexed burner, uint256 value);

    /**
     * @dev Burns a specific amount of tokens.
     * @param _value The amount of token to be burned.
     */
    function burn(uint256 _value) public {
        address burner = msg.sender;
        balances[burner] = balances[burner].sub(_value);
        totalSupply = totalSupply.sub(_value);
        Burn(burner, _value);
    }
}
