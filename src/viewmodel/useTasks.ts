import { useEffect, useMemo, useState } from 'react';
import { Task } from '../model/entities/task';
import { ITaskService } from '../model/service/ITaskService';

export interface UseTasksState {
  tasks: Task[];
  filteredTasks: Task[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

export interface UseTasksActions {
  refresh: () => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;
  setSearchQuery: (query: string) => void;
}

export function useTasks(taskService: ITaskService): UseTasksState & UseTasksActions {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      return tasks;
    }

    const query = searchQuery.trim().toLowerCase();
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getAllTasks();
      console.log('Tasks carregadas:', data.length);
      setTasks(data);
    } catch (err) {
      console.error('Erro ao carregar tasks:', err);
      setError('Erro ao carregar as tarefas');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    setError(null);
    try {
      await taskService.deleteTask(id);
      await refresh();
    } catch (err) {
      setError('Erro ao deletar a tarefa');
      throw err;
    }
  };

  const toggleComplete = async (id: number) => {
    setError(null);
    try {
      await taskService.toggleTaskCompletion(id);
      await refresh();
    } catch (err) {
      setError('Erro ao alterar status da tarefa');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { tasks, filteredTasks, loading, error, searchQuery, refresh, deleteTask, toggleComplete, setSearchQuery };
}
