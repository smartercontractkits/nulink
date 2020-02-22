pragma solidity 0.5.0;

import "../NuLinkClient.sol";

contract ServiceAgreementConsumer is NuLinkClient {
  uint256 constant private ORACLE_PAYMENT = 1 * LINK;

  bytes32 internal sAId;
  bytes32 public currentPrice;

  constructor(address _link, address _coordinator, bytes32 _sAId) public {
    setNuLinkToken(_link);
    setNuLinkOracle(_coordinator);
    sAId = _sAId;
  }

  function requestEthereumPrice(string memory _currency) public {
    NuLink.Request memory req = buildNuLinkRequest(sAId, address(this), this.fulfill.selector);
    req.add("get", "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,EUR,JPY");
    req.add("path", _currency);
    sendNuLinkRequest(req, ORACLE_PAYMENT);
  }

  function fulfill(bytes32 _requestId, bytes32 _price)
    public
    recordNuLinkFulfillment(_requestId)
  {
    currentPrice = _price;
  }
}
