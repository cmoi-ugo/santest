import { LoginForm } from '@/features/auth/components/AuthForm';
import { login } from '@/services/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
  setIsAuthenticated?: (value: boolean) => void;
}

const LoginPage = ({ setIsAuthenticated }: LoginPageProps) => {
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    try {
      setApiError(undefined); 
      const res = await login(email, password);
      localStorage.setItem('token', res.access_token);
      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }
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
