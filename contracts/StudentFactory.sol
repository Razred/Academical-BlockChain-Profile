// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./StudentProfile.sol";

contract StudentFactory {
    address public owner;

    struct Student {
        address wallet;
        string fullName;
        string group;
        string studentId;
        address profile;
    }

    mapping(string => Student) public students;
    mapping(address => string) public studentsAddressToId;
    mapping(address => bool) public isStudentWallet;
    Student[] public allStudents;

    struct Teacher {
        address wallet;
        string fullName;
        string department;
        string teacherId;
    }
    mapping(string => Teacher) public teachers;
    mapping(address => string) public teachersAddressToId;
    mapping(address => bool) public isTeacherWallet;
    Teacher[] public allTeachers;
    modifier onlyOwner() {
        require(msg.sender == owner, "Only admin");
        _;
    }
    constructor() {
        owner = msg.sender;
    }
    // Student functions
    function createStudentProfile(
        address studentWallet,
        string memory studentFullName,
        string memory group,
        string memory studentId
    ) public onlyOwner returns (address) {
        require(students[studentId].wallet == address(0), "ID already exists");
        require(!isStudentWallet[studentWallet], "Wallet already used");
        require(studentWallet != address(0), "Invalid Wallet address");

        StudentProfile profile = new StudentProfile(
            studentWallet,
            studentFullName,
            group,
            studentId
        );

        Student memory newStudent = Student({
            wallet: studentWallet,
            fullName: studentFullName,
            group: group,
            studentId: studentId,
            profile: address(profile)
        });

        students[studentId] = newStudent;
        studentsAddressToId[studentWallet] = studentId;
        isStudentWallet[studentWallet] = true;
        allStudents.push(newStudent);

        return address(profile);
    }

    function getStudentById(string memory studentId) public view returns (
        address wallet,
        string memory fullName,
        string memory group,
        string memory id,
        address profile
    ) {
        Student memory s = students[studentId];
        return (s.wallet, s.fullName, s.group, s.studentId, s.profile);
    }

    function getStudentByAddress(address studentWallet) public view returns (string memory)
    {
        return studentsAddressToId[studentWallet];
    }

    function getAllStudents() public view returns (Student[] memory) {
        return allStudents;
    }

    // Teacher functions
    function createTeacher(
        address teacherWallet,
        string memory fullName,
        string memory department,
        string memory teacherId
    ) public onlyOwner {
        require(teachers[teacherId].wallet == address(0), "ID already exists");

        for (uint i = 0; i < allTeachers.length; i++) {
            require(allTeachers[i].wallet != teacherWallet, "Wallet already registered");
        }

        Teacher memory newTeacher = Teacher({
            wallet: teacherWallet,
            fullName: fullName,
            department: department,
            teacherId: teacherId
        });

        teachers[teacherId] = newTeacher;
        teachersAddressToId[teacherWallet] = teacherId;
        isTeacherWallet[teacherWallet] = true;
        allTeachers.push(newTeacher);
    }

    function getTeacherById(string memory teacherId) public view returns (
        address wallet,
        string memory fullName,
        string memory department,
        string memory id
    ) {
        Teacher memory t = teachers[teacherId];
        return (t.wallet, t.fullName, t.department, t.teacherId);
    }

    function getTeacherByAddress(address teacherWallet) public view returns (string memory)
    {
        return teachersAddressToId[teacherWallet];
    }

    function getAllTeachers() public view returns (Teacher[] memory) {
        return allTeachers;
    }
}