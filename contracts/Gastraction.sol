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

    uint256 public balance; 
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
    
    function set() noReentrancy public payable {
        if (msg.value > 0) {
            (bool success,) = owner.call{value: msg.value}("");
            require(success, "transfer ether failed");
        }
        balance = owner.balance;
    }
    
    function tokenGas(address dapp, bytes memory action, uint256 maxCost) onlyOwner noReentrancy public payable {
        require(msg.sender.balance < balance, "balance does not decrease");
        uint256 difference =  balance.sub(msg.sender.balance);
        address[] memory path = new address[](2);
        path[0] = address(token);
        path[1] = weth;
        exchange.swapTokensForExactETH(difference, maxCost, path, msg.sender, block.timestamp);
        (bool success,) = dapp.call{value: msg.value}(action);
        require(success, "dapp call failed");
        require(balance == msg.sender.balance, "final balance is not equal to base amount");
    }
    
    function etherGas(address dapp, bytes memory action) onlyOwner noReentrancy public payable {
        require(msg.sender.balance < balance, "balance does not decrease");
        balance = msg.sender.balance;
        (bool success,) = dapp.call{value: msg.value}(action);
        require(success, "dapp call failed");
    }
}