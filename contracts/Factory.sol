pragma solidity >=0.4.21 <0.7.0;

import './Gastraction.sol';

/** 
 *   Facctory for gas abstraction proxy contracts
 */
contract Factory {

  /**
    * @notice Struct for assets
  */
  struct User {
      address user;
      address token;
    }

  /**
    * @notice Mappings for proxy
  */
  mapping(address => mapping(address => address)) public proxy;
  mapping(address => User) public user;

  address public exchange;
  address public weth;

  /**
    * @notice Emits when an asset is created.
  */
  event CreateProxy(address proxy, address creator, address token);

  constructor(address _exchange, address _weth) public {
    exchange = _exchange;
    weth = _weth;
  }

  /**
    * @dev Deploy a new proxy contract instance
  */
  function createProxy(address _token) public {
    require(proxy[msg.sender][_token] == address(0), 'factory: is already in use');
    //Deploy proxy instance 
    Gastraction _proxy = new Gastraction(msg.sender, exchange, _token, weth);
    //Register deployment of proxy
    proxy[msg.sender][_token] = address(_proxy);
    user[address(_proxy)] = User({
        user: msg.sender,
        token: _token
    });
    emit CreateProxy(address(_proxy), msg.sender, _token);
  }
}

  