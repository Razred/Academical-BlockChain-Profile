// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./StudentProfile.sol";

contract StudentFactory {
    address public owner;

    mapping(address => address) public studentToProfile;
    address[] public allProfiles;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only admin");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createStudentProfile(
        address student,
        string memory fullName,
        string memory group,
        string memory studentId
    ) public onlyOwner returns (address) {
        require(studentToProfile[student] == address(0), "Already exists");

        StudentProfile profile = new StudentProfile(
            student,
            fullName,
            group,
            studentId
        );

        studentToProfile[student] = address(profile);
        allProfiles.push(address(profile));
        return address(profile);
    }

    function getProfileForStudent(address student) public view returns (address) {
        return studentToProfile[student];
    }

    function getAllProfiles() public view returns (address[] memory) {
        return allProfiles;
    }
}
