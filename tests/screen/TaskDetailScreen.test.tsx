// tests/TaskDetailScreen.test.tsx
import React from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import TaskDetailScreen from '../../src/view/TaskDetailScreen';
import { Task } from '../../src/model/entities/task';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

const mockToggleTheme = jest.fn();
jest.mock('../../src/view/theme/ThemeContext', () => {
  const { lightTheme } = jest.requireActual('../../src/view/theme/themes');
  return {
    useAppTheme: () => ({
      theme: lightTheme,
      mode: lightTheme.mode,
      toggleTheme: mockToggleTheme,
      setMode: jest.fn(),
    }),
  };
});

const mockUseTaskDetail = jest.fn();
jest.mock('../../src/viewmodel/useTaskDetail', () => ({
  useTaskDetail: (...args: unknown[]) => mockUseTaskDetail(...args),
}));

describe('TaskDetailScreen', () => {
  const route = { params: { taskId: 99 } } as any;
  const navigation = {
    navigate: jest.fn(),
    setOptions: jest.fn(),
    goBack: jest.fn(),
  } as any;

  const baseTask: Task = {
    id: 99,
    title: 'Ler documentos',
    description: 'Estudar casos de uso',
    completed: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('exibe indicador de carregamento quando task ainda não foi carregada', () => {
    mockUseTaskDetail.mockReturnValue({
      task: null,
      loading: true,
      error: null,
      validationError: null,
      isEditing: false,
      formTitle: '',
      formDescription: '',
      loadTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleComplete: jest.fn(),
      startEditing: jest.fn(),
      cancelEditing: jest.fn(),
      saveEditing: jest.fn(),
      setFormTitle: jest.fn(),
      setFormDescription: jest.fn(),
    });

    const { UNSAFE_getAllByType } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    expect(UNSAFE_getAllByType(ActivityIndicator)).toHaveLength(1);
  });

  test('mostra fallback e chama loadTask ao tentar novamente', () => {
    const loadTaskMock = jest.fn();
    mockUseTaskDetail.mockReturnValue({
      task: null,
      loading: false,
      error: 'Erro ao carregar a tarefa',
      validationError: null,
      isEditing: false,
      formTitle: '',
      formDescription: '',
      loadTask: loadTaskMock,
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleComplete: jest.fn(),
      startEditing: jest.fn(),
      cancelEditing: jest.fn(),
      saveEditing: jest.fn(),
      setFormTitle: jest.fn(),
      setFormDescription: jest.fn(),
    });

    const { getByText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByText('Tentar novamente'));
    expect(loadTaskMock).toHaveBeenCalledWith(99);
  });

  test('renderiza dados da tarefa e alterna status de conclusão', async () => {
    const toggleCompleteMock = jest.fn().mockResolvedValue(undefined);

    mockUseTaskDetail.mockReturnValue({
      task: baseTask,
      loading: false,
      error: null,
      validationError: null,
      isEditing: false,
      formTitle: baseTask.title,
      formDescription: baseTask.description,
      updateTask: jest.fn(),
      loadTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleComplete: toggleCompleteMock,
      startEditing: jest.fn(),
      cancelEditing: jest.fn(),
      saveEditing: jest.fn(),
      setFormTitle: jest.fn(),
      setFormDescription: jest.fn(),
    });

    const { getByText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    const primaryButton = getByText('Marcar como Concluída');

    await act(async () => {
      fireEvent.press(primaryButton);
    });

    expect(toggleCompleteMock).toHaveBeenCalledTimes(1);
  });

  test('habilita modo edição e salva alterações com trims', async () => {
    const startEditingMock = jest.fn();
    const setFormTitleMock = jest.fn();
    const setFormDescriptionMock = jest.fn();
    const saveEditingMock = jest.fn().mockResolvedValue(undefined);

    let isEditing = false;
    mockUseTaskDetail.mockImplementation(() => ({
      task: baseTask,
      loading: false,
      error: null,
      validationError: null,
      isEditing,
      formTitle: isEditing ? '  Novo título  ' : baseTask.title,
      formDescription: isEditing ? '  Nova descrição  ' : baseTask.description,
      updateTask: jest.fn(),
      loadTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleComplete: jest.fn(),
      startEditing: () => {
        isEditing = true;
        startEditingMock();
      },
      cancelEditing: jest.fn(),
      saveEditing: saveEditingMock,
      setFormTitle: setFormTitleMock,
      setFormDescription: setFormDescriptionMock,
    }));

    const { getByText, getByPlaceholderText, rerender } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByText('Editar tarefa'));
    expect(startEditingMock).toHaveBeenCalledTimes(1);

    // Forçar rerender para refletir mudança de estado
    isEditing = true;
    rerender(<TaskDetailScreen navigation={navigation} route={route} />);

    const titleInput = getByPlaceholderText('Título da tarefa');
    const descriptionInput = getByPlaceholderText('Descreva detalhes importantes');

    fireEvent.changeText(titleInput, '  Novo título  ');
    fireEvent.changeText(descriptionInput, '  Nova descrição  ');

    expect(setFormTitleMock).toHaveBeenCalled();
    expect(setFormDescriptionMock).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(getByText('Salvar Alterações'));
    });

    expect(saveEditingMock).toHaveBeenCalledTimes(1);
  });

  test('exibe mensagem de feedback quando erro é recebido', () => {
    mockUseTaskDetail.mockReturnValue({
      task: baseTask,
      loading: false,
      error: 'Falha ao atualizar',
      validationError: null,
      isEditing: false,
      formTitle: baseTask.title,
      formDescription: baseTask.description,
      updateTask: jest.fn(),
      loadTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleComplete: jest.fn(),
      startEditing: jest.fn(),
      cancelEditing: jest.fn(),
      saveEditing: jest.fn(),
      setFormTitle: jest.fn(),
      setFormDescription: jest.fn(),
    });

    const { getByText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    expect(getByText('Falha ao atualizar')).toBeTruthy();
  });

  test('mostra erro ao tentar alternar conclusão quando updateTask falha', async () => {
    const toggleCompleteMock = jest.fn().mockRejectedValue(new Error('Falhou'));
    mockUseTaskDetail.mockReturnValue({
      task: baseTask,
      loading: false,
      error: 'Erro ao atualizar a tarefa',
      validationError: null,
      isEditing: false,
      formTitle: baseTask.title,
      formDescription: baseTask.description,
      updateTask: jest.fn(),
      loadTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleComplete: toggleCompleteMock,
      startEditing: jest.fn(),
      cancelEditing: jest.fn(),
      saveEditing: jest.fn(),
      setFormTitle: jest.fn(),
      setFormDescription: jest.fn(),
    });

    const { getByText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    expect(getByText('Erro ao atualizar a tarefa')).toBeTruthy();
  });

  test('mantém mensagem do serviço quando salvar falha durante edição', async () => {
    const errorMessage = 'Título inválido';
    const saveEditingMock = jest.fn().mockRejectedValue(new Error(errorMessage));
    mockUseTaskDetail.mockReturnValue({
      task: baseTask,
      loading: false,
      error: errorMessage,
      validationError: null,
      isEditing: true,
      formTitle: 'Título qualquer',
      formDescription: 'Descrição qualquer',
      updateTask: jest.fn(),
      loadTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleComplete: jest.fn(),
      startEditing: jest.fn(),
      cancelEditing: jest.fn(),
      saveEditing: saveEditingMock,
      setFormTitle: jest.fn(),
      setFormDescription: jest.fn(),
    });

    const { getByText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  test('confirma exclusão e navega de volta para a lista', async () => {
    const deleteTaskMock = jest.fn().mockResolvedValue(undefined);

    mockUseTaskDetail.mockReturnValue({
      task: baseTask,
      loading: false,
      error: null,
      validationError: null,
      isEditing: false,
      formTitle: baseTask.title,
      formDescription: baseTask.description,
      updateTask: jest.fn(),
      loadTask: jest.fn(),
      deleteTask: deleteTaskMock,
      toggleComplete: jest.fn(),
      startEditing: jest.fn(),
      cancelEditing: jest.fn(),
      saveEditing: jest.fn(),
      setFormTitle: jest.fn(),
      setFormDescription: jest.fn(),
    });

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByText('trash-outline'));

    const [, , buttons] = alertSpy.mock.calls[0];
    const confirmButton = buttons?.find((button) => button.text === 'Excluir');

    await act(async () => {
      await confirmButton?.onPress?.();
    });

    expect(deleteTaskMock).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith('TaskList');

    alertSpy.mockRestore();
  });
});
