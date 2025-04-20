import React, { useState } from 'react';
import { ethers } from 'ethers';
import profileAbi from '../abi/StudentProfile.json';

export default function TeacherDashboard() {
  const [contractAddress, setContractAddress] = useState('');
  const [pendingRecords, setPendingRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, profileAbi, signer);
  };

  const loadPending = async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      const pending = await contract.getPendingRecords();
      const info = await contract.getStudentInfo();
      setPendingRecords(pending);
      setStudentInfo({
        fullName: info[0],
        group: info[1],
        studentId: info[2],
      });
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      alert("Ошибка загрузки записей");
    }
    setLoading(false);
  };

  const handleConfirm = async (index, approve, comment) => {
    try {
      const contract = await getContract();
      const tx = approve
        ? await contract.approveRecord(index, comment)
        : await contract.rejectRecord(index, comment);
      await tx.wait();
      alert("Запись обработана");
      loadPending();
    } catch (err) {
      console.error("Ошибка подтверждения:", err);
      alert("Ошибка подтверждения");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">👨‍🏫 Панель преподавателя</h1>

      <form onSubmit={(e) => {
        e.preventDefault();
        loadPending();
      }} className="space-y-2">
        <input
          placeholder="Адрес контракта студента"
          className="border p-2 w-full rounded"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Загрузить записи
        </button>
      </form>

      {loading ? (
        <p>Загрузка...</p>
      ) : pendingRecords.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Студент: {studentInfo?.fullName} ({studentInfo?.group})</h2>
          {pendingRecords.map((rec, idx) => (
            <div key={idx} className="bg-gray-100 p-4 rounded border">
              <p><strong>{rec.title}</strong> — {rec.category}</p>
              <p>{rec.description}</p>
              <p><strong>Оценка:</strong> {rec.grade}</p>
              <p className="text-sm text-gray-500">{new Date(Number(rec.timestamp) * 1000).toLocaleString()}</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const comment = e.target[`comment-${idx}`].value;
                  const approve = e.nativeEvent.submitter.name === "approve";
                  handleConfirm(idx, approve, comment);
                }}
                className="mt-3 space-y-2"
              >
                <textarea name={`comment-${idx}`} required className="w-full border p-2 rounded" placeholder="Комментарий" />
                <div className="flex gap-2">
                  <button name="approve" className="bg-green-600 text-white px-4 py-1 rounded">Подтвердить</button>
                  <button name="reject" className="bg-red-600 text-white px-4 py-1 rounded">Отклонить</button>
                </div>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Нет записей на подтверждение.</p>
      )}
    </div>
  );
}
