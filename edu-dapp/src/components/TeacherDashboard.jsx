import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import factoryAbi from '../abi/StudentFactory.json';
import profileAbi from '../abi/StudentProfile.json';

const factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // твой актуальный адрес фабрики

export default function TeacherDashboard() {
  const [account, setAccount] = useState(null);
  const [pendingRecords, setPendingRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    setAccount(accounts[0]);
  };

  const getFactoryContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(factoryAddress, factoryAbi, signer);
  };

  const getProfileContract = async (profileAddress) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(profileAddress, profileAbi, signer);
  };

  const fetchPendingRecords = async () => {
    setLoading(true);
    try {
      const factory = await getFactoryContract();
      const students = await factory.getAllStudents();
      let teacherRecords = [];
  
      for (const student of students) {
        const profileContract = await getProfileContract(student.profile);
        const allRecords = await profileContract.getAllRecords();
  
        const studentId = await factory.getStudentByAddress(student.wallet);
        const studentInfo = await factory.getStudentById(studentId);
  
        const formattedRecords = allRecords.map((rec, idx) => ({
          title: rec[0],
          description: rec[1],
          category: rec[2],
          link: rec[3],
          reviewer: rec[4],
          confirmer: rec[5],
          comment: rec[6],
          status: rec[7],
          timestamp: rec[8],
          studentProfile: student.profile,
          realIndex: idx,
          studentFullName: studentInfo[1],
          studentGroup: studentInfo[2],
          studentId: studentInfo[3]
        }));
  
        for (const record of formattedRecords) {
          if (Number(record.status) === 0 && record.reviewer.toLowerCase() === account.toLowerCase()) {
            teacherRecords.push(record);
          }
        }
      }
  
      setPendingRecords(teacherRecords);
    } catch (err) {
      console.error("Ошибка загрузки записей:", err);
    }
    setLoading(false);
  };

  const approveRecord = async (profileAddress, index, comment) => {
    try {
      const contract = await getProfileContract(profileAddress);
      const tx = await contract.approveRecord(index, comment);
      await tx.wait();
      alert('✅ Запись подтверждена!');
      fetchPendingRecords();
    } catch (err) {
      console.error("Ошибка подтверждения:", err);
      alert('❌ Ошибка при подтверждении записи');
    }
  };

  const rejectRecord = async (profileAddress, index, comment) => {
    try {
      const contract = await getProfileContract(profileAddress);
      const tx = await contract.rejectRecord(index, comment);
      await tx.wait();
      alert('❌ Запись отклонена!');
      fetchPendingRecords();
    } catch (err) {
      console.error("Ошибка отклонения:", err);
      alert('❌ Ошибка при отклонении записи');
    }
  };

  useEffect(() => {
    if (account) fetchPendingRecords();
  }, [account]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">👨‍🏫 Кабинет Преподавателя</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Подключить MetaMask
        </button>
      ) : (
        <>
          <p><strong>Вы вошли как:</strong> <span className="font-mono">{account}</span></p>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">📥 Записи на проверку</h2>

            {loading ? (
              <p>Загрузка...</p>
            ) : pendingRecords.length === 0 ? (
              <p className="text-gray-600">Нет новых записей для проверки</p>
            ) : (
              <ul className="space-y-4">
                {pendingRecords.map((r, idx) => (
                  <li key={idx} className="border rounded p-4 bg-gray-50">
                  <p><strong>ФИО студента:</strong> {r.studentFullName}</p>
                  <p><strong>Группа:</strong> {r.studentGroup}</p>
                  <p><strong>ID студента:</strong> {r.studentId}</p>
                  <hr className="my-2" />
                  <p><strong>Название:</strong> {r.title}</p>
                  <p><strong>Категория:</strong> {r.category}</p>
                  <p><strong>Описание:</strong> {r.description}</p>
                  {r.link && (
                    <p><strong>Ссылка:</strong> <a href={r.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">{r.link}</a></p>
                  )}
                    <p className="text-sm text-gray-500">
                      Дата отправки: {new Date(Number(r.timestamp) * 1000).toLocaleString()}
                    </p>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => {
                          const comment = prompt("Комментарий к подтверждению:");
                          if (comment !== null) approveRecord(r.studentProfile, r.realIndex, comment);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        ✅ Подтвердить
                      </button>
                      <button
                        onClick={() => {
                          const comment = prompt("Комментарий к отклонению:");
                          if (comment !== null) rejectRecord(r.studentProfile, r.realIndex, comment);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        ❌ Отклонить
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
