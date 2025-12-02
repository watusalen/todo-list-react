import { useEffect, useState } from 'react';
import { Task } from '../model/entities/task';
import { ITaskService } from '../model/service/ITaskService';

export interface UseTaskDetailState {
  task: Task | null;
  loading: boolean;
  error: string | null;
  validationError: string | null;
  isEditing: boolean;
  formTitle: string;
  formDescription: string;
}

export interface UseTaskDetailActions {
  loadTask: (id: number) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: () => Promise<void>;
  toggleComplete: () => Promise<void>;
  startEditing: () => void;
  cancelEditing: () => void;
  saveEditing: () => Promise<void>;
  setFormTitle: (title: string) => void;
  setFormDescription: (description: string) => void;
}

export function useTaskDetail(taskService: ITaskService, taskId?: number): UseTaskDetailState & UseTaskDetailActions {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');

  const loadTask = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTaskById(id);
      setTask(data);
      setFormTitle(data.title);
      setFormDescription(data.description);
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
      setFormTitle(updatedTask.title);
      setFormDescription(updatedTask.description);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao atualizar a tarefa');
      }
      throw err;
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

  const toggleComplete = async () => {
    if (!task || isEditing) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await taskService.updateTask(updatedTask);
      setTask(updatedTask);
    } catch (err) {
      setError('Erro ao atualizar a tarefa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    if (!task) return;
    setIsEditing(true);
    setError(null);
    setValidationError(null);
  };

  const cancelEditing = () => {
    if (!task) return;
    setIsEditing(false);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setError(null);
    setValidationError(null);
  };

  const saveEditing = async () => {
    if (!task) return;

    const trimmedTitle = formTitle.trim();
    const trimmedDescription = formDescription.trim();

    setValidationError(null);

    if (!trimmedTitle || !trimmedDescription) {
      setValidationError('Informe título e descrição.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updatedTask = { ...task, title: trimmedTitle, description: trimmedDescription };
      await taskService.updateTask(updatedTask);
      setTask(updatedTask);
      setFormTitle(trimmedTitle);
      setFormDescription(trimmedDescription);
      setIsEditing(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao atualizar a tarefa');
      }
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

  return { 
    task, 
    loading, 
    error, 
    validationError,
    isEditing,
    formTitle,
    formDescription,
    loadTask, 
    updateTask, 
    deleteTask,
    toggleComplete,
    startEditing,
    cancelEditing,
    saveEditing,
    setFormTitle,
    setFormDescription,
  };
}
