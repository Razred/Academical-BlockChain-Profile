// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract StudentProfile {
    address public student;
    address public createdBy;

    string public studentFullName;
    string public group;
    string public studentId;

    enum Status { Pending, Approved, Rejected }

    struct Record {
        string title;
        string description;
        string category;
        string link;
        address reviewer;
        address confirmer;
        string comment;
        Status status;
        uint256 timestamp;
    }

    Record[] private records;

    modifier onlyStudent() {
        require(msg.sender == student, "Not the student");
        _;
    }

    constructor(address _student, string memory _studentFullName, string memory _group, string memory _studentId) {
        student = _student;
        studentFullName = _studentFullName;
        group = _group;
        studentId = _studentId;
        createdBy = msg.sender;
    }

    function submitRecord(
        string memory title,
        string memory description,
        string memory category,
        string memory link,
        address reviewer
    ) public onlyStudent {
        records.push(Record({
            title: title,
            description: description,
            category: category,
            link: link,
            reviewer: reviewer,
            confirmer: address(0),
            comment: "",
            status: Status.Pending,
            timestamp: block.timestamp
        }));
    }

    function approveRecord(uint index, string memory comment) public {
        require(index < records.length, "Invalid index");
        Record storage rec = records[index];
        require(rec.status == Status.Pending, "Already processed");
        require(msg.sender == rec.reviewer, "Not assigned reviewer");

        rec.status = Status.Approved;
        rec.comment = comment;
        rec.confirmer = msg.sender;
    }

    function rejectRecord(uint index, string memory comment) public {
        require(index < records.length, "Invalid index");
        Record storage rec = records[index];
        require(rec.status == Status.Pending, "Already processed");
        require(msg.sender == rec.reviewer, "Not assigned reviewer");

        rec.status = Status.Rejected;
        rec.comment = comment;
        rec.confirmer = msg.sender;
    }

    function getApprovedRecords() public view returns (Record[] memory) {
        uint count = 0;
        for (uint i = 0; i < records.length; i++) {
            if (records[i].status == Status.Approved) {
                count++;
            }
        }

        Record[] memory approved = new Record[](count);
        uint j = 0;
        for (uint i = 0; i < records.length; i++) {
            if (records[i].status == Status.Approved) {
                approved[j++] = records[i];
            }
        }

        return approved;
    }

    function getMyPendingRecords() public view returns (Record[] memory) {
        uint count = 0;
        for (uint i = 0; i < records.length; i++) {
            if (records[i].status == Status.Pending && records[i].reviewer == msg.sender) {
                count++;
            }
        }

        Record[] memory pending = new Record[](count);
        uint j = 0;
        for (uint i = 0; i < records.length; i++) {
            if (records[i].status == Status.Pending && records[i].reviewer == msg.sender) {
                pending[j++] = records[i];
            }
        }

        return pending;
    }

    function getAllRecords() public view returns (Record[] memory) {
        return records;
    }

    function getStudentInfo() public view returns (string memory, string memory, string memory) {
        return (studentFullName, group, studentId);
    }
}