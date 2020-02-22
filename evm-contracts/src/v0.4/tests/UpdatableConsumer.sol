pragma solidity 0.4.24;

import "./Consumer.sol";

contract UpdatableConsumer is Consumer {

  constructor(bytes32 _specId, address _ens, bytes32 _node) public {
    specId = _specId;
    useNuLinkWithENS(_ens, _node);
  }

  function updateOracle() public {
    updateNuLinkOracleWithENS();
  }

  function getNuLinkToken() public view returns (address) {
    return nulinkTokenAddress();
  }

  function getOracle() public view returns (address) {
    return nulinkOracleAddress();
  }

}
