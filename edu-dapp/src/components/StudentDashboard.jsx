import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import factoryAbi from '../abi/StudentFactory.json';
import profileAbi from '../abi/StudentProfile.json';

const factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // замени на свой реальный адрес

export default function StudentDashboard() {
  const [account, setAccount] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [studentFullName, setStudentFullName] = useState(null);
  const [profileContractAddress, setProfileContractAddress] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Установите MetaMask!");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };

  const fetchStudentInfo = async () => {
    try {
      const contract = await getFactoryContract();
      const id = await contract.getStudentByAddress(account);

      if (id && id !== "") {
        setStudentId(id);
  
        const studentInfo = await contract.getStudentById(id);
        setStudentFullName(studentInfo[1]);
        const profileAddr = studentInfo[4];
        setProfileContractAddress(profileAddr);
      } else {
        alert("🚫 Ваш адрес не привязан к профилю студента. Обратитесь к администратору.");
      }
    } catch (err) {
      console.error("Ошибка загрузки профиля студента:", err);
    }
  };

  const loadRecords = async () => {
    try {
      if (!profileContractAddress) return;
      setLoading(true);
      const contract = await getProfileContract();
      const result = await contract.getAllRecords();
      setRecords(result);
    } catch (err) {
      console.error("Ошибка загрузки записей:", err);
    } finally {
      setLoading(false);
    }
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
    if (account) {
      fetchStudentInfo();
    }
  }, [account]);

  useEffect(() => {
    if (profileContractAddress) {
      loadRecords();
    }
  }, [profileContractAddress]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">👨‍🎓 Кабинет Студента</h1>

      {!account ? (
        <button onClick={connectWallet} className="bg-blue-600 text-white px-4 py-2 rounded">
          Подключить MetaMask
        </button>
      ) : studentId && profileContractAddress ? (
        <>
          <p><strong>Вы вошли как:</strong> <span className="font-mono">{account}</span></p>
          <p><strong>Ваше имя:</strong> <span className="font-mono">{studentFullName}</span></p>
          <p><strong>Ваш ID студента:</strong> <span className="font-mono">{studentId}</span></p>
          <p><strong>Контракт профиля:</strong> <span className="font-mono">{profileContractAddress}</span></p>

          <form onSubmit={addRecord} className="space-y-2 mt-6">
            <h2 className="text-lg font-semibold">Добавить достижение</h2>
            <input name="title" placeholder="Название" className="border p-2 w-full rounded" required />
            <textarea name="description" placeholder="Описание" className="border p-2 w-full rounded" required />
            <input name="category" placeholder="Категория" className="border p-2 w-full rounded" required />
            <input name="link" placeholder="Ссылка (если есть)" className="border p-2 w-full rounded" />
            <input name="reviewer" placeholder="Адрес преподавателя" className="border p-2 w-full rounded" required />
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Отправить
            </button>
          </form>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">📘 Все достижения</h2>
            {loading ? (
              <p>Загрузка...</p>
            ) : records.length === 0 ? (
              <p className="text-gray-600">Пока нет записей</p>
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
        <p className="text-red-600 mt-4">Профиль не найден или ваш адрес не зарегистрирован.</p>
      )}
    </div>
  );
}
