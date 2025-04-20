import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import AdminPanel from './components/AdminPanel';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import HomePage from './components/HomePage';
// import EmployerView from './components/EmployerView';

function App() {
  return (
    <Router>
      <div className="p-6 max-w-4xl mx-auto font-sans space-y-4">
        <nav className="flex gap-4 border-b pb-2 mb-4">
          <Link to="/" className="text-blue-600 hover:underline">Главная</Link>
          <Link to="/admin" className="text-blue-600 hover:underline">Админ</Link>
          <Link to="/student" className="text-blue-600 hover:underline">Студент</Link>
          <Link to="/teacher" className="text-blue-600 hover:underline">Преподаватель</Link>
          {/* <Link to="/employer" className="text-blue-600 hover:underline">Работодатель</Link> */}
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          {/* <Route path="/employer" element={<EmployerView />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
