const Factory = artifacts.require("Factory")
const Abstraction = artifacts.require("Gastraction")
const Token = artifacts.require("ERC20");
const EXC = artifacts.require("Exchange");
const Counter = artifacts.require("Counter");
const truffleAssert = require('truffle-assertions')

contract('Gastraction', async accounts => {
	let factory
	let abstraction
	let token
	let weth
	let counter
	before(async() => {
		counter = await Counter.deployed()
		token = await Token.deployed()
		factory = await Factory.deployed()
		await factory.createProxy(token.address)
		let _proxy = await factory.proxy(accounts[0], token.address)
		abstraction = await Abstraction.at(_proxy)
		_weth = await factory.weth()
		weth = await Token.at(_weth)
		_exchange = await factory.exchange()
		exchange = await EXC.at(_exchange)	
		//Send ETH to the exchange for testing
		await exchange.sendTransaction({from: accounts[0], value: "10000000000000000000"})
		//Send Tokens to the proxy contract
		await token.transfer(abstraction.address, "1000000000000000000000000")
	})
	describe('tokenGas()', function () {
		it('should execute function while ether balance is the same', async () => {
			//1. Pay gas using tokens no call - check balance is done in the function tokenGas()
			let estimate = await abstraction.tokenGas.estimateGas(accounts[0], "0x0", "2000000000000000000", 10000000)
			
			console.log(abstraction)
			
			let transaction = await abstraction.tokenGas(accounts[0], "0x0", "200000000000000000000", estimate)
			//2. Pay gas using tokens plus call
			let method =  counter.contract.methods.add().encodeABI()
			estimate = await abstraction.tokenGas.estimateGas(counter.address, method, "2000000000000000000", 10000000)
			transaction = await abstraction.tokenGas(counter.address, method, "2000000000000000000", estimate)
			let counted = await counter.count(abstraction.address)
			assert.equal(counted.toString(), "1", "tokenGas(): action is not performed")
		})	
		it('should fail if not owner', async () => {
			let method = token.contract.methods.approve(exchange.address, "5000000000000000000000").encodeABI()
			estimate = await abstraction.tokenGas.estimateGas(token.address, method, "2000000000000000000", 10000000)
			truffleAssert.reverts(abstraction.tokenGas(token.address, method, "200000000000000000000", estimate, {from: accounts[1]}))
		})	
	})
	
	describe('etherGas()', function () {
		it('should execute function', async () => {
			let method = token.contract.methods.approve(exchange.address, "10000000000000000000000").encodeABI()
			await abstraction.etherGas(token.address, method)
		})	
		it('should fail if not owner', async () => {
			let method = token.contract.methods.approve(exchange.address, "5000000000000000000000").encodeABI()
			truffleAssert.reverts(abstraction.etherGas(token.address, method, {from: accounts[1]}))
		})	
	})
});
