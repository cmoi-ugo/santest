const API_URL = 'http://localhost:8000';

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.detail || 'Erreur lors de la connexion';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const register = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.detail || 'Erreur lors de l\'inscription';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    throw error;
  }
};
