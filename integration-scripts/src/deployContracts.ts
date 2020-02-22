import { OracleFactory } from '@nulink/contracts/ethers/v0.4/OracleFactory'
import {
  createProvider,
  deployContract,
  DEVNET_ADDRESS,
  getArgs,
  registerPromiseHandler,
} from './common'
import { deployLinkTokenContract } from './deployLinkTokenContract'
import { EthLogFactory } from './generated/EthLogFactory'
import { RunLogFactory } from './generated/RunLogFactory'

async function main() {
  registerPromiseHandler()
  const args = getArgs(['CHAINLINK_NODE_ADDRESS'])

  await deployContracts({ nulinkNodeAddress: args.CHAINLINK_NODE_ADDRESS })
}
main()

interface Args {
  nulinkNodeAddress: string
}
async function deployContracts({ nulinkNodeAddress }: Args) {
  const provider = createProvider()
  const signer = provider.getSigner(DEVNET_ADDRESS)

  const linkToken = await deployLinkTokenContract()

  const oracle = await deployContract(
    { Factory: OracleFactory, name: 'Oracle', signer },
    linkToken.address,
  )
  await oracle.setFulfillmentPermission(nulinkNodeAddress, true)

  await deployContract({ Factory: EthLogFactory, name: 'EthLog', signer })

  await deployContract(
    { Factory: RunLogFactory, name: 'RunLog', signer },
    linkToken.address,
    oracle.address,
  )
}
