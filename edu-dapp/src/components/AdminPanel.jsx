import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import factoryAbi from '../abi/StudentFactory.json';

const factoryAddress = '...'; 

export default function AdminPanel() {
  const [account, setAccount] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const [studentAddress, setStudentAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [group, setGroup] = useState('');
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState('');

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

  const createProfile = async () => {
    try {
      setStatus("Создание профиля...");
      const contract = await getContract();
      const tx = await contract.createStudentProfile(
        studentAddress,
        fullName,
        group,
        studentId
      );
      await tx.wait();
      setStatus("Профиль успешно создан!");
    } catch (err) {
      console.error(err);
      setStatus("Ошибка создания профиля");
    }
  };

  useEffect(() => {
    connect();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Панель администратора</h1>

      <p className="mb-2">Вы вошли как: <span className="font-mono">{account}</span></p>
      <p className="mb-4">Владелец контракта: <span className="font-mono">{owner}</span></p>

      {isOwner ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-3">Создать профиль студента</h2>

            <input
              placeholder="Адрес студента"
              className="border p-2 w-full mb-2 rounded"
              value={studentAddress}
              onChange={(e) => setStudentAddress(e.target.value)}
            />
            <input
              placeholder="ФИО студента"
              className="border p-2 w-full mb-2 rounded"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              onClick={createProfile}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Создать профиль
            </button>
          </div>

          {status && <p className="text-sm text-gray-700">{status}</p>}
        </div>
      ) : (
        <p className="text-red-600 font-semibold">У вас нет прав администратора.</p>
      )}
    </div>
  );
}
