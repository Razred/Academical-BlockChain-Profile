import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import factoryAbi from '../abi/StudentFactory.json';
import profileAbi from '../abi/StudentProfile.json';

const factoryAddress = '...';

export default function StudentDashboard() {
  const [account, setAccount] = useState(null);
  const [profileContractAddress, setProfileContractAddress] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };

  const getFactoryContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(factoryAddress, factoryAbi, signer);
  };

  const getProfileContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(profileContractAddress, profileAbi, signer);
  };

  const fetchProfileAddress = async () => {
    try {
      const factory = await getFactoryContract();
      const addr = await factory.getProfileForStudent(account);
      if (addr === ethers.ZeroAddress) {
        alert("Профиль не найден. Обратитесь к администратору.");
        return;
      }
      setProfileContractAddress(addr);
    } catch (err) {
      console.error("Ошибка получения адреса профиля:", err);
    }
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      const contract = await getProfileContract();
      const result = await contract.getAllRecords();
      setRecords(result);
    } catch (err) {
      console.error("Ошибка загрузки записей:", err);
    }
    setLoading(false);
  };

  const addRecord = async (e) => {
    e.preventDefault();
    const { title, description, category, link, reviewer } = e.target.elements;

    try {
      const contract = await getProfileContract();

      if (!ethers.isAddress(reviewer.value)) {
        alert("Введите корректный адрес преподавателя");
        return;
      }

      const tx = await contract.submitRecord(
        title.value,
        description.value,
        category.value,
        link.value,
        reviewer.value
      );
      await tx.wait();
      alert("✅ Запись отправлена на проверку преподавателю");
      loadRecords();
      e.target.reset();
    } catch (err) {
      console.error("Ошибка добавления записи:", err);
      alert("Ошибка при добавлении записи");
    }
  };

  useEffect(() => {
    if (account) fetchProfileAddress();
  }, [account]);

  useEffect(() => {
    if (profileContractAddress) loadRecords();
  }, [profileContractAddress]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">👨‍🎓 Кабинет Студента</h1>

      {!account ? (
        <button onClick={connectWallet} className="bg-blue-600 text-white px-4 py-2 rounded">
          Подключить MetaMask
        </button>
      ) : profileContractAddress ? (
        <>
          <p><strong>Вы вошли как:</strong> <span className="font-mono">{account}</span></p>
          <p><strong>Контракт профиля:</strong> <span className="font-mono">{profileContractAddress}</span></p>

          <form onSubmit={addRecord} className="space-y-2 mt-6">
            <h2 className="text-lg font-semibold">Добавить достижение</h2>
            <input name="title" placeholder="Название" className="border p-2 w-full rounded" required />
            <textarea name="description" placeholder="Описание" className="border p-2 w-full rounded" required />
            <input name="category" placeholder="Категория (course, article, attendance...)" className="border p-2 w-full rounded" required />
            <input name="link" placeholder="Ссылка (если есть)" className="border p-2 w-full rounded" />
            <input name="reviewer" placeholder="Адрес преподавателя" className="border p-2 w-full rounded" required />
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Отправить на подтверждение
            </button>
          </form>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">📘 Все записи</h2>
            {loading ? (
              <p>Загрузка...</p>
            ) : records.length === 0 ? (
              <p className="text-gray-600">Пока записей нет</p>
            ) : (
              <ul className="space-y-3">
                {records.map((r, i) => (
                  <li key={i} className="border rounded p-3 bg-gray-50">
                    <p><strong>{r.title}</strong> — {r.category}</p>
                    <p>{r.description}</p>
                    {r.link && (
                      <p><strong>Ссылка:</strong> <a href={r.link} target="_blank" rel="noreferrer">{r.link}</a></p>
                    )}
                    <p><strong>Статус:</strong> {["⏳ На проверке", "✅ Подтверждено", "❌ Отклонено"][Number(r.status)]}</p>
                    <p><strong>Комментарий:</strong> {r.comment}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(Number(r.timestamp) * 1000).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <p className="text-red-600 mt-4">Профиль не найден</p>
      )}
    </div>
  );
}