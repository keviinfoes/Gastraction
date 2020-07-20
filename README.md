# Gastraction
Gastraction - smart contract based abstraction for token gas payments

## Description
To include a transaction in the ethereum blockchain a user needs to pay gas in the native token ether. This step makes the use of the blockchain complicated for end users. 

It is not possible to remove payment of gas (transaction fee). However it is possible to make it easier by letting users pay with their tokens instead of the native ethereum token. The best implementation for full abstraction (payment using tokens) is [GSN](https://www.opengsn.org/). The main limitation is that GSN needs to be implemented on the smart contract side of a dapp. Limited many dapps have done this to date.

Gastraction adds a new option, called partial abstraction. This is abstraction where the users indirectly pays for gas with their token. Gasstraction can be used by users themselfs or integrated in the front end of dapps. No changes in the smart contracts is needed. This is done by creating a proxy contract for every user and calling smart contract functions through the proxy. After every call the  proxy contract trades the token amount of gas for the spend ether in gas. This keeps the eth balance ~equal and deducts the gas from the token balance. The user still needs a small amount of ether (for example 0.1 ETH), but after the first deposit they don't have to look at the ether balance at all. 

## Run example
Gastraction is deployed to the ropsten test network. With a dummy token and exchange. The exchange rate is fixed at 200 dummy tokens per test ether.

To try the example counter. Where you can pay in tokens to add plus 1 to the counter:
1. Go to the example directory `cd ~/gastraction/example`.
2. Install dependencies `npm install`.
3. Run the example `npm run`.

The example will help you through the steps of generating a proxy account and requesting tokens. 

## Smart contracts
To run the test `truffle test`.
To deploy the contracts `truffle migrate`.

Note that the migration also deploys a dummy token and exchange contract. This can be adjusted in the migration file for mainnet deploy.







