const Factory = artifacts.require("Factory")
const Abstraction = artifacts.require("Gastraction")
const Token = artifacts.require("ERC20");

contract('Factory', async accounts => {
	let factory
	let token
	before(async() => {
		factory = await Factory.deployed()
		token = await Token.deployed()	
	})
	describe('DeployFactory()', function () {
		it('should deploy main factory', async () => {
			let exchange = await factory.exchange()
			let weth = await factory.weth()
			assert.notEqual(exchange.toString(), "0x0000000000000000000000000000000000000000", "Factory(): exchange address is not set")
			assert.notEqual(weth.toString(), "0x0000000000000000000000000000000000000000", "Factory(): weth address is not set")
		})		
	})
	describe('CreateProxy()', function () {
		it('should create new proxy', async () => {
			await factory.createProxy(token.address)
			let _proxy = await factory.proxy(accounts[0], token.address)
			let abstraction = await Abstraction.at(_proxy)
			let owner = await abstraction.owner()
			assert.equal(accounts[0], owner, "CreateProxy(): proxy is not created")
		})
		it('should store data new proxy', async () => {
			let _proxy = await factory.proxy(accounts[0], token.address)
			let _user = await factory.user(_proxy)
			assert.equal(accounts[0], _user.user, "CreateProxy(): user is not stored")
			assert.equal(token.address, _user.token, "CreateAsset(): token is not stored")	
		})
	})
});
