import { RegisterForm } from '@/features/auth/components/AuthForm';
import { register } from '@/services/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const handleRegister = async (email: string, password: string) => {
    try {
      setApiError(undefined); 
      await register(email, password);
      navigate('/login'); 
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('Une erreur inconnue est survenue');
      }
    }
  };

  return <RegisterForm onSubmit={handleRegister} apiError={apiError} />;
};

export default RegisterPage;