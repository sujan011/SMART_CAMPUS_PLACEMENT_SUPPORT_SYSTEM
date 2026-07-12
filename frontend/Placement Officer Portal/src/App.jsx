import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Students from './pages/Students';
import Jobs from './pages/Jobs';
import Placements from './pages/Placements';
import Interviews from './pages/Interviews';
import Reports from './pages/Reports';
import Applications from './pages/Applications';
import Analytics from './pages/Analytics';

// Placeholder for unimplemented routes
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-96">
    <div className="text-4xl mb-4">🚧</div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
    <p className="text-slate-500">This module is under construction.</p>
  </div>
);

function App() {
  React.useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('dark', isDark);

    const accent = localStorage.getItem('accentColor') || 'blue';
    document.documentElement.classList.remove('theme-blue', 'theme-indigo', 'theme-purple', 'theme-emerald');
    document.documentElement.classList.add(`theme-${accent}`);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Additional Sidebar Routes */}
            <Route path="/students" element={<Students />} />
            <Route path="/companies" element={<Placeholder title="Company Partners" />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/placements" element={<Placements />} />
            <Route path="/drives" element={<Placeholder title="Campus Drives" />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
