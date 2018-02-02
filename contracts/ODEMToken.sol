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
}
