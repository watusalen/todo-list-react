// tests/useTaskDetail.test.ts
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useTaskDetail } from '../../src/viewmodel/useTaskDetail';
import { makeTaskService, sampleTask } from '../utils/testUtils';

describe('useTaskDetail', () => {
  test('loadTask no mount carrega task quando taskId informado', async () => {
    const service = makeTaskService();
    const { result } = renderHook(() => useTaskDetail(service, sampleTask.id));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.task).toEqual(sampleTask);
    expect(result.current.formTitle).toBe(sampleTask.title);
    expect(result.current.formDescription).toBe(sampleTask.description);
    expect(result.current.error).toBeNull();
  });

  test('updateTask chama service.updateTask e atualiza estado local', async () => {
    const service = makeTaskService({ updateTask: jest.fn().mockResolvedValue(undefined) });
    const { result } = renderHook(() => useTaskDetail(service, sampleTask.id));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updated = { ...sampleTask, title: 'Novo' };
    await act(async () => {
      await result.current.updateTask(updated);
    });

    expect(service.updateTask).toHaveBeenCalledWith(updated);
    expect(result.current.task).toEqual(updated);
    expect(result.current.formTitle).toBe('Novo');
  });

  test('deleteTask sem task carregada retorna erro apropriado', async () => {
    const service = makeTaskService();
    const { result } = renderHook(() => useTaskDetail(service)); // sem taskId
    await act(async () => {
      await result.current.deleteTask();
    });
    expect(result.current.error).toBe('Nenhuma tarefa carregada');
  });

  test('quando loadTask falha, seta error', async () => {
    const service = makeTaskService({ getTaskById: jest.fn().mockRejectedValue(new Error('falha')) });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTaskDetail(service, sampleTask.id));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.task).toBeNull();
    expect(result.current.error).toBe('Erro ao carregar a tarefa');

    consoleErrorSpy.mockRestore();
  });

  test('toggleComplete alterna status de conclusão', async () => {
    const service = makeTaskService({ updateTask: jest.fn().mockResolvedValue(undefined) });
    const { result } = renderHook(() => useTaskDetail(service, sampleTask.id));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.task?.completed).toBe(false);

    await act(async () => {
      await result.current.toggleComplete();
    });

    expect(service.updateTask).toHaveBeenCalledWith({ ...sampleTask, completed: true });
    expect(result.current.task?.completed).toBe(true);
  });

  test('startEditing ativa modo de edição', async () => {
    const service = makeTaskService();
    const { result } = renderHook(() => useTaskDetail(service, sampleTask.id));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isEditing).toBe(false);

    act(() => {
      result.current.startEditing();
    });

    expect(result.current.isEditing).toBe(true);
  });

  test('cancelEditing restaura valores originais', async () => {
    const service = makeTaskService();
    const { result } = renderHook(() => useTaskDetail(service, sampleTask.id));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.startEditing();
      result.current.setFormTitle('Modificado');
      result.current.setFormDescription('Modificado');
    });

    expect(result.current.formTitle).toBe('Modificado');

    act(() => {
      result.current.cancelEditing();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.formTitle).toBe(sampleTask.title);
    expect(result.current.formDescription).toBe(sampleTask.description);
  });

  test('saveEditing valida campos vazios', async () => {
    const service = makeTaskService({ updateTask: jest.fn().mockResolvedValue(undefined) });
    const { result } = renderHook(() => useTaskDetail(service, sampleTask.id));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.startEditing();
      result.current.setFormTitle('');
    });

    await act(async () => {
      await result.current.saveEditing();
    });

    expect(result.current.validationError).toBe('Informe título e descrição.');
    expect(service.updateTask).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(true);
  });

  test('saveEditing faz trim e atualiza tarefa', async () => {
    const service = makeTaskService({ updateTask: jest.fn().mockResolvedValue(undefined) });
    const { result } = renderHook(() => useTaskDetail(service, sampleTask.id));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.startEditing();
      result.current.setFormTitle('  Novo Título  ');
      result.current.setFormDescription('  Nova Descrição  ');
    });

    await act(async () => {
      await result.current.saveEditing();
    });

    expect(service.updateTask).toHaveBeenCalledWith({
      ...sampleTask,
      title: 'Novo Título',
      description: 'Nova Descrição',
    });
    expect(result.current.isEditing).toBe(false);
    expect(result.current.task?.title).toBe('Novo Título');
  });
});
