import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import factoryAbi from '../abi/StudentFactory.json';

const factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // замени на свой

export default function AdminPanel() {
  const [account, setAccount] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const [studentAddress, setStudentAddress] = useState('');
  const [studentFullName, setStudentFullName] = useState('');
  const [group, setGroup] = useState('');
  const [studentId, setStudentId] = useState('');

  const [teacherFullName, setTeacherFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [teacherWallet, setTeacherWallet] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [status, setStatus] = useState('');

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(factoryAddress, factoryAbi, signer);
  };

  const connect = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);

    const contract = await getContract();
    const ownerAddr = await contract.owner();
    setOwner(ownerAddr);
    setIsOwner(accounts[0].toLowerCase() === ownerAddr.toLowerCase());
  };

  const createStudentProfile = async () => {
    try {
      setStatus("Создание профиля студента...");
      const contract = await getContract();
      const tx = await contract.createStudentProfile(
        studentAddress,
        studentFullName,
        group,
        studentId
      );
      await tx.wait();
      setStatus("✅ Профиль студента успешно создан!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Ошибка создания профиля студента");
    }
  };

  const getAllStudents = async () => {
    try {
      const contract = await getContract();
      const list = await contract.getAllStudents();
      setStudents(list);
    } catch (err) {
      console.error("Ошибка получения студентов:", err);
    }
  };

  const createTeacherProfile = async () => {
    try {
      setStatus("Создание профиля преподавателя...");
      const contract = await getContract();
      const tx = await contract.createTeacher(
        teacherWallet,
        teacherFullName,
        department,
        teacherId
      );
      await tx.wait();
      setStatus("✅ Профиль преподавателя успешно создан!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Ошибка создания профиля преподавателя");
    }
  };

  const getAllTeachers = async () => {
    try {
      const contract = await getContract();
      const list = await contract.getAllTeachers();
      setTeachers(list);
    } catch (err) {
      console.error("Ошибка получения преподавателей:", err);
    }
  };

  useEffect(() => {
    connect();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">🛡️ Панель администратора</h1>

      <p>Вы вошли как: <span className="font-mono">{account}</span></p>
      <p>Владелец фабрики: <span className="font-mono">{owner}</span></p>

      {isOwner ? (
        <>
          {/* Создание студента */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-3">👨‍🎓 Создать профиль студента</h2>

            <input
              placeholder="Адрес студента"
              className="border p-2 w-full mb-2 rounded"
              value={studentAddress}
              onChange={(e) => setStudentAddress(e.target.value)}
            />
            <input
              placeholder="ФИО студента"
              className="border p-2 w-full mb-2 rounded"
              value={studentFullName}
              onChange={(e) => setStudentFullName(e.target.value)}
            />
            <input
              placeholder="Группа"
              className="border p-2 w-full mb-2 rounded"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            />
            <input
              placeholder="ID студента"
              className="border p-2 w-full mb-2 rounded"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
            <button
              onClick={createStudentProfile}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
            >
              Создать студента
            </button>
          </div>

          {/* Создание преподавателя */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-3">👨‍🏫 Создать профиль преподавателя</h2>

            <input
              placeholder="Адрес преподавателя"
              className="border p-2 w-full mb-2 rounded"
              value={teacherWallet}
              onChange={(e) => setTeacherWallet(e.target.value)}
            />
            <input
              placeholder="ФИО преподавателя"
              className="border p-2 w-full mb-2 rounded"
              value={teacherFullName}
              onChange={(e) => setTeacherFullName(e.target.value)}
            />
            <input
              placeholder="Кафедра"
              className="border p-2 w-full mb-2 rounded"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <input
              placeholder="ID преподавателя"
              className="border p-2 w-full mb-2 rounded"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
            />
            <button
              onClick={createTeacherProfile}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mt-2"
            >
              Создать преподавателя
            </button>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-3">📚 Просмотр данных</h2>
            <div className="flex space-x-4 mb-4">
              <button onClick={getAllStudents} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Показать всех студентов
              </button>
              <button onClick={getAllTeachers} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                Показать всех преподавателей
              </button>
            </div>

            {students.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">👨‍🎓 Студенты:</h3>
                <table className="table-auto w-full">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">ФИО</th>
                      <th className="border px-4 py-2">Группа</th>
                      <th className="border px-4 py-2">ID</th>
                      <th className="border px-4 py-2">Кошелек</th>
                      <th className="border px-4 py-2">Смарт Контракт</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={idx}>
                        <td className="border px-4 py-2">{s.fullName}</td>
                        <td className="border px-4 py-2">{s.group}</td>
                        <td className="border px-4 py-2">{s.studentId}</td>
                        <td className="border px-4 py-2">{s.wallet}</td>
                        <td className="border px-4 py-2">{s.profile}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {teachers.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">👨‍🏫 Преподаватели:</h3>
                <table className="table-auto w-full">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">ФИО</th>
                      <th className="border px-4 py-2">Кафедра</th>
                      <th className="border px-4 py-2">ID</th>
                      <th className="border px-4 py-2">Кошелек</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t, idx) => (
                      <tr key={idx}>
                        <td className="border px-4 py-2">{t.fullName}</td>
                        <td className="border px-4 py-2">{t.department}</td>
                        <td className="border px-4 py-2">{t.teacherId}</td>
                        <td className="border px-4 py-2">{t.wallet}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {status && <p className="text-sm text-gray-700 mt-4">{status}</p>}
        </>
      ) : (
        <p className="text-red-600 font-semibold">У вас нет прав администратора.</p>
      )}
    </div>
  );
}
