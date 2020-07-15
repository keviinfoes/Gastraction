const Factory = artifacts.require("Factory")
const Abstraction = artifacts.require("Gastraction")
const Token = artifacts.require("ERC20");
const EXC = artifacts.require("Exchange");
const truffleAssert = require('truffle-assertions')

contract('Gastraction', async accounts => {
	let factory
	let abstraction
	let token
	let weth
	before(async() => {
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
		await exchange.sendTransaction({from: accounts[0], value: "1000000000000000000"})
		//Send Tokens to the proxy contract
		await token.transfer(abstraction.address, "1000000000000000000000000")
	})
	describe('set()', function () {
		it('should set balance', async () => {
			await abstraction.set({from: accounts[0]})	
			let balance = await abstraction.balance()
			assert.notEqual(balance.toString(), "0", "set(): balance is not set")
		})
		it('should set balance and add value transfer', async () => {
			balance = await abstraction.balance()
			await abstraction.set({from: accounts[1], value: "1000000000000000000"})
			let balanceAfter = await abstraction.balance()
			assert(balanceAfter > balance, "set(): deposit value not added")
		})
	})
	describe('tokenGas()', function () {
		it('should execute function while ether balance is the same', async () => {
			//1. Pay gas using tokens no call - check balance is done in the function tokenGas()
			await abstraction.set({from: accounts[0]})	
			await abstraction.tokenGas(accounts[0], "0x0", "200000000000000000000")
			//2. Pay gas using tokens plus call
			let method = token.contract.methods.approve(exchange.address, "1000000000000000000000").encodeABI()
			await abstraction.tokenGas(token.address, method, "2000000000000000000")
			let allowance = await token.allowance(abstraction.address, exchange.address)
			assert.equal(allowance.toString(), "1000000000000000000000", "tokenGas(): action is not performed")
		})	
		it('should fail if not owner', async () => {
			let method = token.contract.methods.approve(exchange.address, "5000000000000000000000").encodeABI()
			truffleAssert.reverts(abstraction.tokenGas(token.address, method, "200000000000000000000", {from: accounts[1]}))
		})		
	})
	describe('etherGas()', function () {
		it('should execute function while ether balance decreases', async () => {
			let balanceBefore = await abstraction.balance()
			let method = token.contract.methods.approve(exchange.address, "10000000000000000000000").encodeABI()
			await abstraction.etherGas(token.address, method)
			let balanceAfter = await abstraction.balance()
			assert(balanceBefore > balanceAfter, "etherGas(): ether balancce did not decrease")
		})	
		it('should fail if not owner', async () => {
			let method = token.contract.methods.approve(exchange.address, "5000000000000000000000").encodeABI()
			truffleAssert.reverts(abstraction.etherGas(token.address, method, {from: accounts[1]}))
		})		
	})
});
