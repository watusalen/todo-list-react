import { Task } from "../../src/model/entities/task";
import { LocalRepository } from "../../src/model/repository/LocalTaskRepository";

describe("LocalRepository", () => {
  let repository: LocalRepository;

  beforeEach(() => {
    repository = new LocalRepository();
  });

  describe("findAll", () => {
    it("deve retornar uma lista vazia quando não há tarefas", async () => {
      const tasks = await repository.findAll();
      expect(tasks).toEqual([]);
    });

    it("deve retornar todas as tarefas salvas", async () => {
      const task1: Task = { id: 0, title: "Tarefa 1", description: "Desc 1", completed: false };
      const task2: Task = { id: 0, title: "Tarefa 2", description: "Desc 2", completed: true };

      await repository.save(task1);
      await repository.save(task2);

      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe("Tarefa 1");
      expect(tasks[1].title).toBe("Tarefa 2");
    });
  });

  describe("save", () => {
    it("deve salvar uma nova tarefa e atribuir um ID", async () => {
      const task: Task = { id: 0, title: "Nova Tarefa", description: "Descrição", completed: false };
      
      await repository.save(task);
      
      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(1);
      expect(tasks[0].title).toBe("Nova Tarefa");
    });

    it("deve incrementar IDs automaticamente para múltiplas tarefas", async () => {
      const task1: Task = { id: 0, title: "Tarefa 1", description: "Desc 1", completed: false };
      const task2: Task = { id: 0, title: "Tarefa 2", description: "Desc 2", completed: false };
      
      await repository.save(task1);
      await repository.save(task2);
      
      const tasks = await repository.findAll();
      expect(tasks[0].id).toBe(1);
      expect(tasks[1].id).toBe(2);
    });

    it("deve preservar o ID se já estiver definido", async () => {
      const task: Task = { id: 100, title: "Tarefa com ID", description: "Descrição", completed: false };
      
      await repository.save(task);
      
      const tasks = await repository.findAll();
      expect(tasks[0].id).toBe(100);
    });
  });

  describe("findById", () => {
    beforeEach(async () => {
      const task1: Task = { id: 0, title: "Tarefa 1", description: "Desc 1", completed: false };
      const task2: Task = { id: 0, title: "Tarefa 2", description: "Desc 2", completed: true };
      await repository.save(task1);
      await repository.save(task2);
    });

    it("deve retornar a tarefa correta pelo ID", async () => {
      const task = await repository.findById(1);
      expect(task.title).toBe("Tarefa 1");
      expect(task.completed).toBe(false);
    });

    it("deve lançar erro quando tarefa não for encontrada", async () => {
      await expect(repository.findById(999)).rejects.toThrow("Tarefa não encontrada!");
    });
  });

  describe("update", () => {
    beforeEach(async () => {
      const task: Task = { id: 0, title: "Tarefa Original", description: "Desc Original", completed: false };
      await repository.save(task);
    });

    it("deve atualizar uma tarefa existente", async () => {
      const updatedTask: Task = { id: 1, title: "Tarefa Atualizada", description: "Desc Atualizada", completed: true };
      
      await repository.update(updatedTask);
      
      const task = await repository.findById(1);
      expect(task.title).toBe("Tarefa Atualizada");
      expect(task.description).toBe("Desc Atualizada");
      expect(task.completed).toBe(true);
    });

    it("deve lançar erro ao tentar atualizar tarefa inexistente", async () => {
      const nonExistentTask: Task = { id: 999, title: "Inexistente", description: "Desc", completed: false };
      
      await expect(repository.update(nonExistentTask)).rejects.toThrow("Tarefa não encontrada!");
    });
  });

  describe("delete", () => {
    beforeEach(async () => {
      const task1: Task = { id: 0, title: "Tarefa 1", description: "Desc 1", completed: false };
      const task2: Task = { id: 0, title: "Tarefa 2", description: "Desc 2", completed: false };
      await repository.save(task1);
      await repository.save(task2);
    });

    it("deve remover a tarefa pelo ID", async () => {
      await repository.delete(1);
      
      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(2);
    });

    it("deve ser silencioso ao tentar deletar tarefa inexistente", async () => {
      await expect(repository.delete(999)).resolves.not.toThrow();
      
      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(2);
    });

    it("deve remover todas as tarefas quando múltiplos deletes são executados", async () => {
      await repository.delete(1);
      await repository.delete(2);
      
      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(0);
    });
  });
});