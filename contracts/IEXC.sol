pragma solidity >=0.4.21 <0.7.0;

interface IEXC {
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
}