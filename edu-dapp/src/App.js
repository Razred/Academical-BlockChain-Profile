import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from './contractABI.json';

const contractAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'; // вставь сюда свой адрес

function App() {
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Подключение кошелька
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Установите MetaMask!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };

  // Отключение
  const disconnectWallet = () => {
    setAccount(null);
    setProfile(null);
  };

  // Загрузка записей студента
  const loadProfile = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const data = await contract.getRecords(account);
      setProfile({ records: data });
      setLoading(false);
    } catch (error) {
      console.error("Ошибка получения записей:", error);
      setLoading(false);
    }
  };

  // Отслеживание смены аккаунта в MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setProfile(null);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (account) loadProfile();
  }, [account]);

  return (
    <div className="p-6 font-sans max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Академический Профиль Студента</h1>
      <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Добавить запись</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const title = e.target.title.value;
          const description = e.target.description.value;
          const category = e.target.category.value;
          const grade = e.target.grade.value;

          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);

            const tx = await contract.addRecord(title, description, category, grade);
            await tx.wait();

            alert("✅ Запись добавлена!");
            loadProfile(); // обновим список
            e.target.reset(); // очистим форму
          } catch (err) {
            console.error("Ошибка добавления:", err);
            alert("Ошибка при добавлении записи.");
          }
        }}
        className="space-y-3"
      >
        <input name="title" placeholder="Название" required className="border p-2 w-full rounded" />
        <textarea name="description" placeholder="Описание" required className="border p-2 w-full rounded" />
        <input name="category" placeholder="Категория (course, skill...)" required className="border p-2 w-full rounded" />
        <input name="grade" placeholder="Оценка / Уровень" required className="border p-2 w-full rounded" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Добавить
        </button>
      </form>
    </div>
      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Подключить MetaMask
        </button>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p>Подключённый адрес: <span className="text-gray-700">{account}</span></p>
            <button
              onClick={disconnectWallet}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Отключить
            </button>
          </div>

          {loading ? (
            <p>Загрузка данных...</p>
          ) : profile ? (
            <div className="space-y-4 mt-4">
              <div>
                <strong>Образовательные записи:</strong>
                <ul className="list-disc ml-6">
                  {profile.records.map((record, idx) => (
                    <li key={idx} className="mb-2">
                      <p><strong>{record.title}</strong> ({record.category})</p>
                      <p>Описание: {record.description}</p>
                      <p>Оценка/уровень: {record.gradeOrLevel}</p>
                      <p>Подтверждён: {record.confirmer}</p>
                      <p>Комментарий: {record.comment}</p>
                      <p>Дата: {new Date(Number(record.timestamp) * 1000).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p>Нет данных профиля.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
