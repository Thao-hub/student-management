import { useState, useCallback } from 'react';
import apiClient from '../services/api';

/**
 * Custom hook for managing API requests with loading and error states
 * @param {string} initialUrl - Initial API endpoint
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export const useApi = (initialUrl = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (url = initialUrl, options = {}) => {
    if (!url) {
      setError('URL is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { method = 'GET', body = null, ...config } = options;
      const response = await apiClient({
        url,
        method,
        data: body,
        ...config,
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An error occurred';
      setError(errorMessage);
      console.error('API Error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [initialUrl]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};
