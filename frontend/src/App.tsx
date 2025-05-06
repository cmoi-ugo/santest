import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@/assets/styles/global.css';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import HomePage from '@/features/home/pages/HomePage';
import { useAuthStore } from '@/features/auth/store/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute isAllowed={isAuthenticated} />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;