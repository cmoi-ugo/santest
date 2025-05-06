import { LoginForm } from '@/features/auth/components/AuthForm';
import { useAuthStore } from '@/features/auth/store/authStore';
import { login } from '@/services/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  const handleLogin = async (email: string, password: string) => {
    try {
      setApiError(undefined); 
      const res = await login(email, password);
      
      setToken(res.access_token);
      
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('Une erreur inconnue est survenue');
      }
    }
  };

  return <LoginForm onSubmit={handleLogin} apiError={apiError} />;
};

export default LoginPage;