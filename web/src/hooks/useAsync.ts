import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar estados de operações assíncronas (loading, error, data).
 * Reduz boilerplate e padroniza o tratamento de erros na UI.
 */
export function useAsync<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (promise: Promise<T>, options?: { 
    onSuccess?: (data: T) => void;
    onError?: (err: Error) => void;
    resetData?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    if (options?.resetData) setData(null);

    try {
      const result = await promise;
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro inesperado';
      setError(message);
      options?.onError?.(err instanceof Error ? err : new Error(message));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    setData,
    setError,
  };
}
