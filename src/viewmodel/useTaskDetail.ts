import { useEffect, useState } from 'react';
import { Task } from '../model/entities/task';
import { ITaskService } from '../model/service/ITaskService';

export interface UseTaskDetailState {
  task: Task | null;
  loading: boolean;
  error: string | null;
}

export interface UseTaskDetailActions {
  loadTask: (id: number) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: () => Promise<void>;
}

export function useTaskDetail(taskService: ITaskService, taskId?: number): UseTaskDetailState & UseTaskDetailActions {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadTask = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTaskById(id);
      setTask(data);
    } catch (err) {
      setError('Erro ao carregar a tarefa');
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    setLoading(true);
    setError(null);
    try {
      await taskService.updateTask(updatedTask);
      setTask(updatedTask);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao atualizar a tarefa');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    if (!task) {
      setError('Nenhuma tarefa carregada');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await taskService.deleteTask(task.id);
    } catch (err) {
      setError('Erro ao deletar a tarefa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      loadTask(taskId);
    }
  }, [taskId]);

  return { task, loading, error, loadTask, updateTask, deleteTask };
}
