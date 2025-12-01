import { useState } from 'react';
import { ITaskService } from '../model/service/ITaskService';

export interface UseTaskCreateState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseTaskCreateActions {
  createTask: (title: string, description: string) => Promise<void>;
  reset: () => void;
}

export function useTaskCreate(taskService: ITaskService): UseTaskCreateState & UseTaskCreateActions {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const createTask = async (title: string, description: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await taskService.createTask(title, description);
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
  };

  return { loading, error, success, createTask, reset };
}
