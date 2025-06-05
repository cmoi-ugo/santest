import axios, { AxiosError, AxiosResponse } from 'axios';

import { API, ERROR_MESSAGES } from '@/config';
import type { ApiError } from '@/types';

/**
 * Instance Axios configurée avec intercepteurs d'erreurs
 */
const api = axios.create({
  baseURL: API.BASE_URL,
  headers: {
    'Content-Type': API.HEADERS.CONTENT_TYPE,
    'Accept': API.HEADERS.ACCEPT
  },
  timeout: API.TIMEOUTS.REQUEST
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response) {
      const errorData = error.response.data;
      const status = error.response.status;
      
      let errorMessage;
      
      switch (status) {
        case 401:
          errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case 404:
          errorMessage = ERROR_MESSAGES.NOT_FOUND;
          break;
        case 500:
          errorMessage = ERROR_MESSAGES.SERVER_ERROR;
          break;
        default:
          errorMessage = errorData?.detail || 
            errorData?.message || 
            `Error ${status}: ${error.response.statusText}`;
      }
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    } else {
      throw error;
    }
  }
);

export default api;