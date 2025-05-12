import axios, { AxiosError, AxiosResponse } from 'axios';
import { API, MESSAGES } from '@/config/constants';

// Création de l'instance Axios
const api = axios.create({
  baseURL: API.BASE_URL,
  headers: {
    'Content-Type': API.HEADERS.CONTENT_TYPE,
    'Accept': API.HEADERS.ACCEPT
  },
  timeout: API.TIMEOUTS.REQUEST
});

// Intercepteur pour gérer les erreurs
interface ApiError {
  detail?: string;
  message?: string;
  statusCode?: number;
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response) {
      const errorData = error.response.data;
      const status = error.response.status;
      
      let errorMessage;
      
      switch (status) {
        case 401:
          errorMessage = MESSAGES.ERROR.UNAUTHORIZED;
          break;
        case 404:
          errorMessage = MESSAGES.ERROR.NOT_FOUND;
          break;
        case 500:
          errorMessage = MESSAGES.ERROR.SERVER_ERROR;
          break;
        default:
          errorMessage = errorData?.detail || 
            errorData?.message || 
            `Error ${status}: ${error.response.statusText}`;
      }
      
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('API Error: No response received');
      throw new Error(MESSAGES.ERROR.NETWORK_ERROR);
    } else {
      console.error('API Error:', error.message);
      throw error;
    }
  }
);

export default api;