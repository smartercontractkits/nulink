pragma solidity 0.4.24;

import "../NuLinked.sol";


contract ConcreteNuLinked is NuLinked {

  constructor(address _link, address _oracle) public {
    setLinkToken(_link);
    setOracle(_oracle);
  }

  event Request(
    bytes32 id,
    address callbackAddress,
    bytes4 callbackfunctionSelector,
    bytes data
  );

  function publicNewRequest(
    bytes32 _id,
    address _address,
    bytes _fulfillmentSignature
  )
    public
  {
    NuLink.Request memory req = newRequest(
      _id, _address, bytes4(keccak256(_fulfillmentSignature)));
    emit Request(
      req.id,
      req.callbackAddress,
      req.callbackFunctionId,
      req.buf.buf
    );
  }

  function publicRequest(
    bytes32 _id,
    address _address,
    bytes _fulfillmentSignature,
    uint256 _wei
  )
    public
  {
    NuLink.Request memory req = newRequest(
      _id, _address, bytes4(keccak256(_fulfillmentSignature)));
    nulinkRequest(req, _wei);
  }

  function publicRequestRunTo(
    address _oracle,
    bytes32 _id,
    address _address,
    bytes _fulfillmentSignature,
    uint256 _wei
  )
    public
  {
    NuLink.Request memory run = newRequest(_id, _address, bytes4(keccak256(_fulfillmentSignature)));
    nulinkRequestTo(_oracle, run, _wei);
  }

  function publicCancelRequest(
    bytes32 _requestId,
    uint256 _payment,
    bytes4 _callbackFunctionId,
    uint256 _expiration
  ) public {
    cancelNuLinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
  }

  function publicNuLinkToken() public view returns (address) {
    return nulinkToken();
  }

  function fulfillRequest(bytes32 _requestId, bytes32)
    public
    recordNuLinkFulfillment(_requestId)
  {} // solhint-disable-line no-empty-blocks

  function publicFulfillNuLinkRequest(bytes32 _requestId, bytes32) public {
    fulfillNuLinkRequest(_requestId);
  }

  event LinkAmount(uint256 amount);

  function publicLINK(uint256 _amount) public {
    emit LinkAmount(LINK.mul(_amount));
  }

  function publicOracleAddress() public view returns (address) {
    return oracleAddress();
  }

  function publicAddExternalRequest(address _oracle, bytes32 _requestId)
    public
  {
    addExternalRequest(_oracle, _requestId);
  }
}
