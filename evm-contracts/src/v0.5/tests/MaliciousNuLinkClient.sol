pragma solidity 0.5.0;

import "./MaliciousNuLink.sol";
import "../NuLinkClient.sol";
import "../vendor/SafeMath.sol";

contract MaliciousNuLinkClient is NuLinkClient {
  using MaliciousNuLink for MaliciousNuLink.Request;
  using MaliciousNuLink for MaliciousNuLink.WithdrawRequest;
  using NuLink for NuLink.Request;
  using SafeMath for uint256;

  uint256 private maliciousRequests = 1;
  mapping(bytes32 => address) private maliciousPendingRequests;

  function newWithdrawRequest(
    bytes32 _specId,
    address _callbackAddress,
    bytes4 _callbackFunction
  ) internal pure returns (MaliciousNuLink.WithdrawRequest memory) {
    MaliciousNuLink.WithdrawRequest memory req;
    return req.initializeWithdraw(_specId, _callbackAddress, _callbackFunction);
  }

  function nulinkTargetRequest(address _target, NuLink.Request memory _req, uint256 _amount)
    internal
    returns(bytes32 requestId)
  {
    requestId = keccak256(abi.encodePacked(_target, maliciousRequests));
    _req.nonce = maliciousRequests;
    maliciousPendingRequests[requestId] = nulinkOracleAddress();
    emit NuLinkRequested(requestId);
    LinkTokenInterface _link = LinkTokenInterface(nulinkTokenAddress());
    require(_link.transferAndCall(nulinkOracleAddress(), _amount, encodeTargetRequest(_req)), "Unable to transferAndCall to oracle");
    maliciousRequests += 1;

    return requestId;
  }

  function nulinkPriceRequest(NuLink.Request memory _req, uint256 _amount)
    internal
    returns(bytes32 requestId)
  {
    requestId = keccak256(abi.encodePacked(this, maliciousRequests));
    _req.nonce = maliciousRequests;
    maliciousPendingRequests[requestId] = nulinkOracleAddress();
    emit NuLinkRequested(requestId);
    LinkTokenInterface _link = LinkTokenInterface(nulinkTokenAddress());
    require(_link.transferAndCall(nulinkOracleAddress(), _amount, encodePriceRequest(_req)), "Unable to transferAndCall to oracle");
    maliciousRequests += 1;

    return requestId;
  }

  function nulinkWithdrawRequest(MaliciousNuLink.WithdrawRequest memory _req, uint256 _wei)
    internal
    returns(bytes32 requestId)
  {
    requestId = keccak256(abi.encodePacked(this, maliciousRequests));
    _req.nonce = maliciousRequests;
    maliciousPendingRequests[requestId] = nulinkOracleAddress();
    emit NuLinkRequested(requestId);
    LinkTokenInterface _link = LinkTokenInterface(nulinkTokenAddress());
    require(_link.transferAndCall(nulinkOracleAddress(), _wei, encodeWithdrawRequest(_req)), "Unable to transferAndCall to oracle");
    maliciousRequests += 1;
    return requestId;
  }

  function encodeWithdrawRequest(MaliciousNuLink.WithdrawRequest memory _req)
    internal pure returns (bytes memory)
  {
    return abi.encodeWithSelector(
      bytes4(keccak256("withdraw(address,uint256)")),
      _req.callbackAddress,
      _req.callbackFunctionId,
      _req.nonce,
      _req.buf.buf);
  }

  function encodeTargetRequest(NuLink.Request memory _req)
    internal pure returns (bytes memory)
  {
    return abi.encodeWithSelector(
      bytes4(keccak256("oracleRequest(address,uint256,bytes32,address,bytes4,uint256,uint256,bytes)")),
      0, // overridden by onTokenTransfer
      0, // overridden by onTokenTransfer
      _req.id,
      _req.callbackAddress,
      _req.callbackFunctionId,
      _req.nonce,
      1,
      _req.buf.buf);
  }

  function encodePriceRequest(NuLink.Request memory _req)
    internal pure returns (bytes memory)
  {
    return abi.encodeWithSelector(
      bytes4(keccak256("oracleRequest(address,uint256,bytes32,address,bytes4,uint256,uint256,bytes)")),
      0, // overridden by onTokenTransfer
      2000000000000000000, // overridden by onTokenTransfer
      _req.id,
      _req.callbackAddress,
      _req.callbackFunctionId,
      _req.nonce,
      1,
      _req.buf.buf);
  }
}
