pragma solidity =0.6.5;

contract Counter {

    mapping(address => uint256) public count;

    /*
    *   Count contract for example
    */
    function add() 
      public returns (bool) {
        count[msg.sender] += 1;
        return true;
    }
}