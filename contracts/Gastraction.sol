pragma solidity >=0.4.21 <0.7.0;

import "./IERC20.sol";
import "./IEXC.sol";
import "./SafeMath.sol";

/*
 *   Gas abstraction contract - proxy contract.
 *   When the external user calls a contract through this proxy, the gascost
 *   is indirectly payed with the token (exchange token -> ether). 
*/
contract Gastraction {
    using SafeMath for uint256;
    
    IEXC public exchange;
    IERC20 public token;
    address public weth;
    address public owner;
        
    bool locked;
    modifier noReentrancy() {
        require(
            !locked,
            "reentrant call."
        );
        locked = true;
        _;
        locked = false;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not the owner");
        _;
    }

    receive() external payable {}
    fallback() external payable {}
    
    //Constructor set exchange and token address
    constructor(address _owner, address _exchange, address _token, address _weth) public {
        exchange = IEXC(_exchange);
        token = IERC20(_token);
        weth = _weth;
        owner = _owner;
        token.approve(address(exchange), uint256(-1));
    }

    function tokenGas(address dapp, bytes memory action, uint256 maxCost, uint256 gas) onlyOwner noReentrancy public payable {

        (bool success,) = dapp.call{value: msg.value}(action);
        require(success, "dapp call failed");
        
        uint256 gasCost = gas.mul(tx.gasprice);
        address[] memory path = new address[](2);
        path[0] = address(token);
        path[1] = weth;
        exchange.swapTokensForExactETH(gasCost, maxCost, path, msg.sender, block.timestamp);
    }

    function etherGas(address dapp, bytes memory action) onlyOwner noReentrancy public payable {
        (bool success,) = dapp.call{value: msg.value}(action);
        require(success, "dapp call failed");
    }
}