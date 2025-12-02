import { useState } from 'react';
import { ITaskService } from '../model/service/ITaskService';

export interface UseTaskCreateState {
  loading: boolean;
  error: string | null;
  success: boolean;
  validationError: string | null;
}

export interface UseTaskCreateActions {
  createTask: (title: string, description: string) => Promise<void>;
  reset: () => void;
}

export function useTaskCreate(taskService: ITaskService): UseTaskCreateState & UseTaskCreateActions {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const createTask = async (title: string, description: string) => {
    setValidationError(null);
    
    if (!title.trim() || !description.trim()) {
      setValidationError('Informe título e descrição.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await taskService.createTask(title.trim(), description.trim());
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao criar a tarefa');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setValidationError(null);
  };

  return { loading, error, success, validationError, createTask, reset };
}
