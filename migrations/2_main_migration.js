const Factory = artifacts.require("Factory");

const WETH = artifacts.require("ERC20");
const EXC = artifacts.require("Exchange");

module.exports = function(deployer) {
  /* ADJUST FOR MAINNET DEPLOY */
  var exchange = "0x0000000000000000000000000000000000000001";
  var weth = "0x0000000000000000000000000000000000000001";
  
  /* FOR TEST ONLY - COMMENT OUT FOR MAINNET DEPLOY */
  deployer.deploy(EXC);
  exchange = EXC.address;
  deployer.deploy(WETH, "weth", "weth");
  weth = WETH.address;

  /* DEPLOY FOR MAINNET */
  deployer.deploy(Factory, exchange, weth);
};
