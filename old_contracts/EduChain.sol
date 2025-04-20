// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EduChain {
    struct Record {
        string title;
        string description;
        string category;
        string gradeOrLevel;
        address confirmer;
        string comment;
        uint256 timestamp;
    }

    mapping(address => Record[]) private studentRecords;

    // Добавление записи студентом
    function addRecord(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _gradeOrLevel
    ) public {
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
    function confirmRecord(address _student, uint256 _recordIndex, string memory _comment) public {
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
}
