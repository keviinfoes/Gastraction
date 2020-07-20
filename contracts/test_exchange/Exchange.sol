pragma solidity >=0.4.21 <0.7.0;

import "../IERC20.sol";

/*
 * This is a example dummy exchange for test purposes ONLY.
 * The name of the function is based on uniswapv2.
 */ 

contract Exchange {

  receive() external payable {}
  fallback() external payable {}

  /*
   *  Function requires initial deposit of ETH in contract 
   *  Uses fixed price of 200 tokens for 1 ETH. 
   *
   */
  function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] memory path, address to, uint deadline) 
      public returns (uint[] memory amounts) {
        require(deadline >= block.timestamp, "deadline passed");
        IERC20 token = IERC20(path[0]);        
        uint cost = amountOut * 200;
        require(token.transferFrom(msg.sender, address(this), cost), "transfer exchange failed");
        amounts = new uint[](2);
        amounts[0] = amountOut;
        amounts[1] = amountInMax;
        payable(to).transfer(amountOut);
  }
}
