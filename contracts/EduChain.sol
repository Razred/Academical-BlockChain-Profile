// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EduChain {
    enum Role { None, Student, Teacher, Employer }

    struct Record {
        string title;
        string description;
        string category;
        string gradeOrLevel;
        address confirmer;
        string comment;
        uint256 timestamp;
    }

    struct StudentInfo {
        string fullName;
        string group;
        string studentId;
    }

    address public owner;

    mapping(address => Role) public roles;
    mapping(address => Record[]) private studentRecords;
    mapping(address => StudentInfo) public studentInfos;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyStudent() {
        require(roles[msg.sender] == Role.Student, "Only student");
        _;
    }

    modifier onlyTeacher() {
        require(roles[msg.sender] == Role.Teacher, "Only teacher");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Назначение роли пользователю (только админ)
    function setRole(address user, Role role) public onlyOwner {
        roles[user] = role;
    }

    // Установка данных студента (ФИО, группа, ID)
    function setStudentInfo(string memory _fullName, string memory _group, string memory _studentId) public onlyStudent {
        studentInfos[msg.sender] = StudentInfo({
            fullName: _fullName,
            group: _group,
            studentId: _studentId
        });
    }

    // Добавление записи студентом
    function addRecord(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _gradeOrLevel
    ) public onlyStudent {
        Record memory newRecord = Record({
            title: _title,
            description: _description,
            category: _category,
            gradeOrLevel: _gradeOrLevel,
            confirmer: address(0),
            comment: "",
            timestamp: block.timestamp
        });

        studentRecords[msg.sender].push(newRecord);
    }

    // Подтверждение преподавателем
    function confirmRecord(
        address _student,
        uint256 _recordIndex,
        string memory _comment
    ) public onlyTeacher {
        require(_recordIndex < studentRecords[_student].length, "Invalid index");

        Record storage rec = studentRecords[_student][_recordIndex];
        require(rec.confirmer == address(0), "Already confirmed");

        rec.confirmer = msg.sender;
        rec.comment = _comment;
    }

    // Получение записей студента
    function getRecords(address _student) public view returns (Record[] memory) {
        return studentRecords[_student];
    }

    // Получение информации о студенте
    function getStudentInfo(address _student) public view returns (StudentInfo memory) {
        return studentInfos[_student];
    }

    function getMyRole() public view returns (Role) {
        return roles[msg.sender];
    }

    function overrideOwner(address newOwner) public {
        owner = newOwner;
    }
}
