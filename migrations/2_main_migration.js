const Factory = artifacts.require("Factory");
const WETH = artifacts.require("ERC20");
const EXC = artifacts.require("Exchange");
const Counter = artifacts.require("Counter");


module.exports = function(deployer) {
  /* ADJUST BELOW FOR MAINNET DEPLOY */
  var exchange = "0x0000000000000000000000000000000000000001";
  var weth = "0x0000000000000000000000000000000000000001";
  
  deployer.then(async () => {
    /* FOR TEST ONLY - COMMENT OUT BELOW FOR MAINNET DEPLOY */
    await deployer.deploy(EXC);
    await deployer.deploy(WETH, "weth", "weth");
    exchange = EXC.address;
    weth = WETH.address;
    /* DO NOT COMMENT OUT BELOW FOR MAINNET DEPLOY */
    await deployer.deploy(Factory, exchange, weth);
    
    await deployer.deploy(Counter);
  });
};
