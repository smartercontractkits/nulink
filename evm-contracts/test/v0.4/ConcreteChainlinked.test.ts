import {
  contract,
  helpers as h,
  matchers,
  oracle,
  setup,
} from '@nulink/test-helpers'
import { assert } from 'chai'
import { ethers } from 'ethers'
import { ConcreteNuLinkedFactory } from '../../ethers/v0.4/ConcreteNuLinkedFactory'
import { EmptyOracleFactory } from '../../ethers/v0.4/EmptyOracleFactory'
import { GetterSetterFactory } from '../../ethers/v0.4/GetterSetterFactory'
import { OracleFactory } from '../../ethers/v0.4/OracleFactory'

const concreteNuLinkedFactory = new ConcreteNuLinkedFactory()
const emptyOracleFactory = new EmptyOracleFactory()
const getterSetterFactory = new GetterSetterFactory()
const oracleFactory = new OracleFactory()
const linkTokenFactory = new contract.LinkTokenFactory()

const provider = setup.provider()

let roles: setup.Roles

beforeAll(async () => {
  const users = await setup.users(provider)

  roles = users.roles
})

describe('ConcreteNuLinked', () => {
  const specId =
    '0x4c7b7ffb66b344fbaa64995af81e355a00000000000000000000000000000000'
  let cc: contract.Instance<ConcreteNuLinkedFactory>
  let gs: contract.Instance<GetterSetterFactory>
  let oc: contract.Instance<OracleFactory | EmptyOracleFactory>
  let newoc: contract.Instance<OracleFactory>
  let link: contract.Instance<contract.LinkTokenFactory>
  const deployment = setup.snapshot(provider, async () => {
    link = await linkTokenFactory.connect(roles.defaultAccount).deploy()
    oc = await oracleFactory.connect(roles.defaultAccount).deploy(link.address)
    newoc = await oracleFactory
      .connect(roles.defaultAccount)
      .deploy(link.address)
    gs = await getterSetterFactory.connect(roles.defaultAccount).deploy()
    cc = await concreteNuLinkedFactory
      .connect(roles.defaultAccount)
      .deploy(link.address, oc.address)
  })

  beforeEach(async () => {
    await deployment()
  })

  describe('#newRequest', () => {
    it('forwards the information to the oracle contract through the link token', async () => {
      const tx = await cc.publicNewRequest(
        specId,
        gs.address,
        ethers.utils.toUtf8Bytes('requestedBytes32(bytes32,bytes32)'),
      )
      const receipt = await tx.wait()

      assert.equal(1, receipt.logs?.length)
      const [jId, cbAddr, cbFId, cborData] = receipt.logs
        ? oracle.decodeCCRequest(receipt.logs[0])
        : []
      const params = h.decodeDietCBOR(cborData ?? '')

      assert.equal(specId, jId)
      assert.equal(gs.address, cbAddr)
      assert.equal('0xed53e511', cbFId)
      assert.deepEqual({}, params)
    })
  })

  describe('#nulinkRequest(Request)', () => {
    it('emits an event from the contract showing the run ID', async () => {
      const tx = await cc.publicRequest(
        specId,
        cc.address,
        ethers.utils.toUtf8Bytes('fulfillRequest(bytes32,bytes32)'),
        0,
      )

      const { events, logs } = await tx.wait()

      assert.equal(4, events?.length)

      assert.equal(logs?.[0].address, cc.address)
      assert.equal(events?.[0].event, 'NuLinkRequested')
    })
  })

  describe('#nulinkRequestTo(Request)', () => {
    it('emits an event from the contract showing the run ID', async () => {
      const tx = await cc.publicRequestRunTo(
        newoc.address,
        specId,
        cc.address,
        ethers.utils.toUtf8Bytes('fulfillRequest(bytes32,bytes32)'),
        0,
      )
      const { events } = await tx.wait()

      assert.equal(4, events?.length)
      assert.equal(events?.[0].event, 'NuLinkRequested')
    })

    it('emits an event on the target oracle contract', async () => {
      const tx = await cc.publicRequestRunTo(
        newoc.address,
        specId,
        cc.address,
        ethers.utils.toUtf8Bytes('fulfillRequest(bytes32,bytes32)'),
        0,
      )
      const { logs } = await tx.wait()
      const event = logs && newoc.interface.parseLog(logs[3])

      assert.equal(4, logs?.length)
      assert.equal(event?.name, 'OracleRequest')
    })

    it('does not modify the stored oracle address', async () => {
      await cc.publicRequestRunTo(
        newoc.address,
        specId,
        cc.address,
        ethers.utils.toUtf8Bytes('fulfillRequest(bytes32,bytes32)'),
        0,
      )

      const actualOracleAddress = await cc.publicOracleAddress()
      assert.equal(oc.address, actualOracleAddress)
    })
  })

  describe('#cancelNuLinkRequest', () => {
    let requestId: string
    // a concrete nulink attached to an empty oracle
    let ecc: contract.Instance<ConcreteNuLinkedFactory>

    beforeEach(async () => {
      const emptyOracle = await emptyOracleFactory
        .connect(roles.defaultAccount)
        .deploy()
      ecc = await concreteNuLinkedFactory
        .connect(roles.defaultAccount)
        .deploy(link.address, emptyOracle.address)

      const tx = await ecc.publicRequest(
        specId,
        ecc.address,
        ethers.utils.toUtf8Bytes('fulfillRequest(bytes32,bytes32)'),
        0,
      )
      const { events } = await tx.wait()
      requestId = (events?.[0]?.args as any).id
    })

    it('emits an event from the contract showing the run was cancelled', async () => {
      const tx = await ecc.publicCancelRequest(
        requestId,
        0,
        ethers.utils.hexZeroPad('0x', 4),
        0,
      )
      const { events } = await tx.wait()

      assert.equal(1, events?.length)
      assert.equal(events?.[0].event, 'NuLinkCancelled')
      assert.equal(requestId, (events?.[0].args as any).id)
    })

    it('throws if given a bogus event ID', async () => {
      await matchers.evmRevert(async () => {
        await ecc.publicCancelRequest(
          ethers.utils.formatBytes32String('bogusId'),
          0,
          ethers.utils.hexZeroPad('0x', 4),
          0,
        )
      })
    })
  })

  describe('#recordNuLinkFulfillment(modifier)', () => {
    let request: oracle.RunRequest

    beforeEach(async () => {
      const tx = await cc.publicRequest(
        specId,
        cc.address,
        ethers.utils.toUtf8Bytes('fulfillRequest(bytes32,bytes32)'),
        0,
      )
      const { logs } = await tx.wait()

      request = oracle.decodeRunRequest(logs?.[3])
    })

    it('emits an event marking the request fulfilled', async () => {
      const tx = await oc.fulfillOracleRequest(
        ...oracle.convertFufillParams(
          request,
          ethers.utils.formatBytes32String('hi mom!'),
        ),
      )
      const { logs } = await tx.wait()

      const event = logs && cc.interface.parseLog(logs[0])

      assert.equal(1, logs?.length)
      assert.equal(event?.name, 'NuLinkFulfilled')
      assert.equal(request.requestId, event?.values.id)
    })
  })

  describe('#fulfillNuLinkRequest(function)', () => {
    let request: oracle.RunRequest

    beforeEach(async () => {
      const tx = await cc.publicRequest(
        specId,
        cc.address,
        ethers.utils.toUtf8Bytes(
          'publicFulfillNuLinkRequest(bytes32,bytes32)',
        ),
        0,
      )
      const { logs } = await tx.wait()

      request = oracle.decodeRunRequest(logs?.[3])
    })

    it('emits an event marking the request fulfilled', async () => {
      const tx = await oc.fulfillOracleRequest(
        ...oracle.convertFufillParams(
          request,
          ethers.utils.formatBytes32String('hi mom!'),
        ),
      )
      const { logs } = await tx.wait()
      const event = logs && cc.interface.parseLog(logs[0])

      assert.equal(1, logs?.length)
      assert.equal(event?.name, 'NuLinkFulfilled')
      assert.equal(request.requestId, event?.values?.id)
    })
  })

  describe('#nulinkToken', () => {
    it('returns the Link Token address', async () => {
      const addr = await cc.publicNuLinkToken()
      assert.equal(addr, link.address)
    })
  })

  describe('#addExternalRequest', () => {
    let mock: contract.Instance<ConcreteNuLinkedFactory>
    let request: oracle.RunRequest

    beforeEach(async () => {
      mock = await concreteNuLinkedFactory
        .connect(roles.defaultAccount)
        .deploy(link.address, oc.address)

      const tx = await cc.publicRequest(
        specId,
        mock.address,
        ethers.utils.toUtf8Bytes('fulfillRequest(bytes32,bytes32)'),
        0,
      )
      const receipt = await tx.wait()

      request = oracle.decodeRunRequest(receipt.logs?.[3])
      await mock.publicAddExternalRequest(oc.address, request.requestId)
    })

    it('allows the external request to be fulfilled', async () => {
      await oc.fulfillOracleRequest(
        ...oracle.convertFufillParams(
          request,
          ethers.utils.formatBytes32String('hi mom!'),
        ),
      )
    })

    it('does not allow the same requestId to be used', async () => {
      await matchers.evmRevert(async () => {
        await cc.publicAddExternalRequest(newoc.address, request.requestId)
      })
    })
  })
})
