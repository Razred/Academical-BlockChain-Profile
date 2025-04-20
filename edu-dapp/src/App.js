import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from './contractABI.json';

const contractAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

const ROLE_NAMES = ['None', 'Student', 'Teacher', 'Employer'];

function App() {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(0);
  const [owner, setOwner] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [profile, setProfile] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);

  const provider = new ethers.BrowserProvider(window.ethereum);

  const connectWallet = async () => {
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };

  const getContract = async () => {
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, abi, signer);
  };

  const loadData = async () => {
    const contract = await getContract();
    const roleId = await contract.getMyRole();
    setRole(Number(roleId));

    const contractOwner = await contract.owner();
    setOwner(contractOwner);
    setIsOwner(account?.toLowerCase() === contractOwner.toLowerCase());

    if (roleId === 1) {
      const info = await contract.getStudentInfo(account);
      setStudentInfo(info);
    }

    const records = await contract.getRecords(account);
    setProfile(records);
  };

  useEffect(() => {
    if (account) {
      loadData();
    }
  }, [account]);

  const assignRole = async (targetAddress, roleId) => {
    const contract = await getContract();
    await contract.setRole(targetAddress, roleId);
    alert("✅ Роль назначена");
  };

  const submitStudentInfo = async (e) => {
    e.preventDefault();
    const contract = await getContract();
    const fullName = e.target.fullName.value;
    const group = e.target.group.value;
    const studentId = e.target.studentId.value;
    await contract.setStudentInfo(fullName, group, studentId);
    alert("✅ Информация сохранена");
  };

  const addRecord = async (e) => {
    e.preventDefault();
    const contract = await getContract();
    const title = e.target.title.value;
    const description = e.target.description.value;
    const category = e.target.category.value;
    const grade = e.target.grade.value;
    const tx = await contract.addRecord(title, description, category, grade);
    await tx.wait();
    alert("✅ Запись добавлена!");
    loadData();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans space-y-6">
      <h1 className="text-3xl font-bold text-center">🎓 Цифровой Профиль Студента</h1>

      {!account ? (
        <button onClick={connectWallet} className="bg-blue-600 text-white px-4 py-2 rounded">
          Подключить MetaMask
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <p><strong>Адрес:</strong> {account}</p>
            <p><strong>Роль:</strong> {ROLE_NAMES[role]}</p>
            {isOwner && <p className="text-green-600">Вы — админ</p>}
          </div>

          {!isOwner && (
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow">
              <div className="mb-2">
                <p className="font-semibold text-yellow-800">
                  🛠 Dev Mode: вы не являетесь владельцем контракта
                </p>
                <p className="text-sm text-yellow-700">
                  Эта функция доступна только в режиме разработки. Удалите её перед деплоем на основную сеть.
                </p>
                <p className="text-sm mt-1 text-yellow-600">
                  Текущий owner: <span className="font-mono">{owner}</span>
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const contract = await getContract();
                    await contract.overrideOwner(account);
                    alert("✅ Вы теперь админ (dev mode)");
                    loadData();
                  } catch (err) {
                    console.error("Ошибка overrideOwner:", err);
                    alert("❌ Ошибка назначения себя админом");
                  }
                }}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Сделать меня админом (только dev)
              </button>
            </div>
          )}


          {isOwner && (
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">🛡 Назначение ролей</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const addr = e.target.addr.value;
                const roleId = parseInt(e.target.roleId.value);
                assignRole(addr, roleId);
              }} className="space-y-2">
                <input name="addr" className="border p-2 w-full rounded" placeholder="Адрес пользователя" required />
                <select name="roleId" className="border p-2 w-full rounded">
                  <option value="1">Student</option>
                  <option value="2">Teacher</option>
                  <option value="3">Employer</option>
                </select>
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">
                  Назначить роль
                </button>
              </form>
            </div>
          )}

          {role === 1 && (
            <>
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">📝 Информация о студенте</h2>
                <form onSubmit={submitStudentInfo} className="space-y-2">
                  <input name="fullName" placeholder="ФИО" className="border p-2 w-full rounded" />
                  <input name="group" placeholder="Группа" className="border p-2 w-full rounded" />
                  <input name="studentId" placeholder="ID студента" className="border p-2 w-full rounded" />
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                    Сохранить
                  </button>
                </form>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">➕ Добавить запись</h2>
                <form onSubmit={addRecord} className="space-y-2">
                  <input name="title" placeholder="Название" className="border p-2 w-full rounded" />
                  <input name="category" placeholder="Категория" className="border p-2 w-full rounded" />
                  <textarea name="description" placeholder="Описание" className="border p-2 w-full rounded" />
                  <input name="grade" placeholder="Оценка / уровень" className="border p-2 w-full rounded" />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Добавить
                  </button>
                </form>
              </div>
            </>
          )}

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">📚 Образовательные записи</h2>
            {profile.length === 0 ? (
              <p className="text-gray-600">Нет записей</p>
            ) : (
              <ul className="space-y-3">
                {profile.map((r, i) => (
                  <li key={i} className="border p-3 rounded bg-gray-100">
                    <p><strong>{r.title}</strong> ({r.category})</p>
                    <p>{r.description}</p>
                    <p><strong>Оценка:</strong> {r.gradeOrLevel}</p>
                    <p><strong>Подтверждён:</strong> {r.confirmer}</p>
                    <p><strong>Комментарий:</strong> {r.comment}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(Number(r.timestamp) * 1000).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
