//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.12;

import {BlockpostServiceManager} from "../src/BlockpostServiceManager.sol";
import {MockAVSDeployer} from "@eigenlayer-middleware/test/utils/MockAVSDeployer.sol";
import {TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract BlockpostTaskManagerTest is MockAVSDeployer {
    BlockpostServiceManager sm;

    address operator =
        address(uint160(uint256(keccak256(abi.encodePacked("operator")))));
    address generator =
        address(uint160(uint256(keccak256(abi.encodePacked("generator")))));

    function setUp() public {
        _deployMockEigenLayerAndAVS();
        sm = new BlockpostServiceManager(
            address(avsDirectory),
            address(stakeRegistry),
            address(delegationMock)
        );
    }

    function testCreateNewTask() public {
        cheats.prank(generator, generator);

        //Store a message
        sm.createNewTask("world");

        //latestTaskNum is incrementing
        assertEq(sm.latestTaskNum(), 1);

        //message is stored and we can fetch it
        assertEq(sm.storedTask(0), "world");

        //wrong index
        assertEq(sm.storedTask(1), "");
    }
}
