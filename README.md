# NuLink

[![Join the chat at https://discordapp.com/invite/aSK4zew](https://img.shields.io/discord/592041321326182401.svg?logoColor=white)](https://discordapp.com/invite/aSK4zew)
[![CircleCI](https://circleci.com/gh/smartercontractkit/nulink.svg?style=shield)](https://circleci.com/gh/smartercontractkit/nulink)
[![Go Report Card](https://goreportcard.com/badge/github.com/smartercontractkit/nulink)](https://goreportcard.com/report/github.com/smartercontractkit/nulink)
[![GoDoc](https://godoc.org/github.com/smartercontractkit/nulink?status.svg)](https://godoc.org/github.com/smartercontractkit/nulink)
[![Maintainability](https://api.codeclimate.com/v1/badges/273722bb9f6f22d799bd/maintainability)](https://codeclimate.com/github/smartercontractkit/nulink/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/273722bb9f6f22d799bd/test_coverage)](https://codeclimate.com/github/smartercontractkit/nulink/test_coverage)

NuLink is middleware to simplify communication with blockchains.
Here you'll find the NuLink Golang node, currently in alpha.
This initial implementation is intended for use and review by developers,
and will go on to form the basis for NuLink's [decentralized oracle network](https://link.smartcontract.com/whitepaper).
Further development of the NuLink Node and NuLink Network will happen here,
if you are interested in contributing please see our [contribution guidelines](./docs/CONTRIBUTING.md).
The current node supports:

- easy connectivity of on-chain contracts to any off-chain computation or API
- multiple methods for scheduling both on-chain and off-chain computation for a user's smart contract
- automatic gas price bumping to prevent stuck transactions, assuring your data is delivered in a timely manner
- push notification of smart contract state changes to off-chain systems, by tracking Ethereum logs
- translation of various off-chain data types into EVM consumable types and transactions
- easy to implement smart contract libraries for connecting smart contracts directly to their preferred oracles
- easy to install node, which runs natively across operating systems, blazingly fast, and with a low memory footprint

Examples of how to utilize and integrate NuLinks can be found in the [examples](./examples) directory.

## Install

1. [Install Go 1.12+](https://golang.org/doc/install#install), and add your GOPATH's [bin directory to your PATH](https://golang.org/doc/code.html#GOPATH)
2. Install [NodeJS](https://nodejs.org/en/download/package-manager/) & [Yarn](https://yarnpkg.com/lang/en/docs/install/)
3. Download NuLink: `git clone https://github.com/smartercontractkit/nulink && cd nulink`
4. Build and install NuLink: `make install`
5. Run the node: `nulink help`

### Ethereum Node Requirements

In order to run the NuLink node you must have access to a running Ethereum node with an open websocket connection.
Any Ethereum based network will work once you've [configured](https://github.com/smartercontractkit/nulink#configure) the chain ID.
Ethereum node versions currently tested and supported:

- [Parity 1.11+](https://github.com/paritytech/parity-ethereum/releases) (due to a [fix with pubsub](https://github.com/paritytech/parity/issues/6590).)
- [Geth 1.8+](https://github.com/ethereum/go-ethereum/releases)

## Run

**NOTE**: By default, nulink will run in TLS mode. For local development you can either disable this by setting CHAINLINK_DEV to true, or generate self signed certificates using `tools/bin/self-signed-certs` or [manually](https://github.com/smartercontractkit/nulink/wiki/Creating-Self-Signed-Certificates).

To start your NuLink node, simply run:

```bash
$ nulink local node
```

By default this will start on port 6688, where it exposes a [REST API](https://github.com/smartercontractkit/nulink/wiki/REST-API).

Once your node has started, you can view your current jobs with:

```bash
$ nulink jobspecs
```

View details of a specific job with:

```bash
$ nulink show $JOB_ID
```

To find out more about the NuLink CLI, you can always run `nulink help`.

Check out the [wiki](https://github.com/smartercontractkit/nulink/wiki)'s pages on [Adapters](https://github.com/smartercontractkit/nulink/wiki/Adapters) and [Initiators](https://github.com/smartercontractkit/nulink/wiki/Initiators) to learn more about how to create Jobs and Runs.

## Configure

You can configure your node's behavior by setting environment variables which can be, along with default values that get used if no corresponding environment variable is found. The latest information on configuration variables are available in [the docs](https://docs.chain.link/docs/configuration-variables).

## Project Directory

This project contains several sub-projects, some with their own documentation.

- [evm](/evm) - smart contract-related resources
  - [box](/evm/box) - [NuLink Truffle box](https://www.trufflesuite.com/blog/using-truffle-to-interact-with-nulink-smart-contracts)
- [@nulink/contracts](/evm-contracts) - smart contract-related resources
- [examples](/examples) - collection of example NuLink integrations
  - [testnet](/examples/testnet) - guide to creating, deploying and using NuLinked smart contracts
- [explorer](/explorer) - [NuLink Explorer](https://explorer.chain.link/)
- [integration/forks](/integration/forks) - integration test for [ommers](https://ethereum.stackexchange.com/a/46/19503) and [re-orgs](https://en.bitcoin.it/wiki/Chain_Reorganization)
- [sgx](/sgx) - experimental, optional module that can be loaded into NuLink to do processing within an [SGX](https://software.intel.com/en-us/sgx) enclave
- [styleguide](/styleguide) - NuLink style guide
- [tools](/tools) - NuLink tools

## External Adapters

External adapters are what make NuLink easily extensible, providing simple integration of custom computations and specialized APIs.
A NuLink node communicates with external adapters via a simple REST API.

For more information on creating and using external adapters, please see our [external adapters page](https://github.com/smartercontractkit/nulink/wiki/External-Adapters).

## Development Setup

For the latest information on setting up a development environment, see the [guide here](https://github.com/smartercontractkit/nulink/wiki/Development-Setup-Guide).

### Build your current version

```bash
$ go build -o nulink ./core/
```

- Run the binary:

```bash
$ ./nulink
```

### Test

1. [Install Yarn](https://yarnpkg.com/lang/en/docs/install)

2. Build contracts:

```bash
$ yarn
$ yarn setup:contracts
```

3. Ready for testing:

```bash
$ go test -parallel=1 ./...
```

### Solidity Development

1. [Install Yarn](https://yarnpkg.com/lang/en/docs/install)
2. Install the dependencies:

```bash
$ cd evm
$ yarn install
```

3. Run tests:

```bash
$ yarn run test-sol
```

### Use of Go Generate

Go generate is used to generate mocks in this project. Mocks are generate with [mockery](https://github.com/vektra/mockery) and live in core/internal/mocks.

### Development Tips

For more tips on how to build and test NuLink, see our [development tips page](https://github.com/smartercontractkit/nulink/wiki/Development-Tips).

## Contributing

NuLink's source code is [licensed under the MIT License](https://github.com/smartercontractkit/nulink/blob/master/LICENSE), and contributions are welcome.

Please check out our [contributing guidelines](./docs/CONTRIBUTING.md) for more details.

Thank you!
