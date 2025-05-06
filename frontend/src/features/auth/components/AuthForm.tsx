import { FaRegUser } from "react-icons/fa6";
import styles from './AuthForm.module.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type AuthFormProps = {
  onSubmit: (email: string, password: string) => void;
  apiError?: string;
  formType: 'login' | 'register';
  submitButtonText: string;
};

const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const AuthForm: React.FC<AuthFormProps> = ({ 
  onSubmit, 
  apiError, 
  formType,
  submitButtonText
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    terms: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      terms: ''
    };

    // Validation de l'email
    if (!email) {
      newErrors.email = 'L\'email est requis';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide';
      isValid = false;
    }

    // Validation du mot de passe
    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    }

    // Validation des conditions (uniquement pour register)
    if (formType === 'register' && !termsAccepted) {
      newErrors.terms = 'Vous devez accepter les conditions';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      onSubmit(email, password);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.topBar}>
      <div className={styles.navButtons}>
          <button 
            onClick={() => navigate('/login')} 
            className={`${styles.navButton} ${formType === 'login' ? styles.active : ''}`}
          >
            Connexion
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className={`${styles.navButton} ${formType === 'register' ? styles.active : ''}`}
          >
            Inscription
          </button>
        </div>
      </div>
      <div className={styles.bottomBar}></div>
      <div className={styles.rightRail}></div>
      <div className={styles.leftRail}></div>

      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <div className={styles.logoCircle}>
          <div className={styles.userIcon}>
            <FaRegUser size={48} color="#1e1e1e" />
          </div>
        </div>

        <div className={styles.inputField}>
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>

        <div className={styles.inputField}>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          {errors.password && <p className={styles.error}>{errors.password}</p>}
        </div>

        {formType === 'register' && (
          <>
            <div className={styles.checkboxField}>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="terms"
                  className={styles.checkbox}
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span className={styles.checkmark}></span>
              </div>
              <label htmlFor="terms" className={styles.termsLabel}>
                J'ai pris connaissance des conditions d'utilisation et de la politique de confidentialité
              </label>
            </div>
            {errors.terms && <p className={styles.error}>{errors.terms}</p>}
          </>
        )}

        {apiError && <p className={styles.error}>{apiError}</p>}

        <button type="submit" className={styles.submitButton}>
          {submitButtonText}
        </button>
      </form>
    </div>
  );
};

export const LoginForm: React.FC<Omit<AuthFormProps, 'formType' | 'submitButtonText'>> = (props) => (
  <AuthForm 
    {...props}
    formType="login"
    submitButtonText="Se connecter"
  />
);

export const RegisterForm: React.FC<Omit<AuthFormProps, 'formType' | 'submitButtonText'>> = (props) => (
  <AuthForm 
    {...props}
    formType="register"
    submitButtonText="S'inscrire"
  />
);