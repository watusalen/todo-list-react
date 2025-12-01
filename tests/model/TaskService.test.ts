import { Task } from "../../src/model/entities/task";
import { IRepository } from "../../src/model/repository/ITaskRepository";
import { TaskService } from "../../src/model/service/TaskService";

// Mock do repository para isolar os testes do service
class MockRepository implements IRepository {
  private tasks: Task[] = [];
  private nextId: number = 1;

  async findAll(): Promise<Task[]> {
    return [...this.tasks];
  }

  async findById(id: number): Promise<Task> {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      throw new Error("Tarefa não encontrada!");
    }
    return { ...task };
  }

  async save(task: Task): Promise<void> {
    if (!task.id) {
      task.id = this.nextId++;
    }
    this.tasks.push({ ...task });
  }

  async update(task: Task): Promise<void> {
    const index = this.tasks.findIndex(t => t.id === task.id);
    if (index === -1) {
      throw new Error("Tarefa não encontrada!");
    }
    this.tasks[index] = { ...task };
  }

  async delete(id: number): Promise<void> {
    this.tasks = this.tasks.filter(t => t.id !== id);
  }

  // Método auxiliar para limpar os dados nos testes
  clear(): void {
    this.tasks = [];
    this.nextId = 1;
  }
}

describe("TaskService", () => {
  let service: TaskService;
  let mockRepository: MockRepository;

  beforeEach(() => {
    mockRepository = new MockRepository();
    service = new TaskService(mockRepository);
  });

  describe("getAllTasks", () => {
    it("deve retornar todas as tarefas do repository", async () => {
      // Preparação
      const task1: Task = { id: 1, title: "Tarefa 1", description: "Desc 1", completed: false };
      const task2: Task = { id: 2, title: "Tarefa 2", description: "Desc 2", completed: true };
      await mockRepository.save(task1);
      await mockRepository.save(task2);

      // Execução
      const tasks = await service.getAllTasks();

      // Verificação
      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe("Tarefa 1");
      expect(tasks[1].title).toBe("Tarefa 2");
    });

    it("deve retornar array vazio quando não há tarefas", async () => {
      const tasks = await service.getAllTasks();
      expect(tasks).toEqual([]);
    });
  });

  describe("getTaskById", () => {
    beforeEach(async () => {
      const task: Task = { id: 1, title: "Tarefa Teste", description: "Descrição", completed: false };
      await mockRepository.save(task);
    });

    it("deve retornar a tarefa correta pelo ID", async () => {
      const task = await service.getTaskById(1);
      expect(task.title).toBe("Tarefa Teste");
    });

    it("deve lançar erro quando tarefa não existe", async () => {
      await expect(service.getTaskById(999)).rejects.toThrow("Tarefa não encontrada!");
    });
  });

  describe("createTask", () => {
    it("deve criar uma nova tarefa com título e descrição válidos", async () => {
      await service.createTask("Nova Tarefa", "Nova Descrição");

      const tasks = await service.getAllTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe("Nova Tarefa");
      expect(tasks[0].description).toBe("Nova Descrição");
      expect(tasks[0].completed).toBe(false);
    });

    it("deve aparar espaços em branco do título e descrição", async () => {
      await service.createTask("  Título com espaços  ", "  Descrição com espaços  ");

      const tasks = await service.getAllTasks();
      expect(tasks[0].title).toBe("Título com espaços");
      expect(tasks[0].description).toBe("Descrição com espaços");
    });

    it("deve lançar erro quando título está vazio", async () => {
      await expect(service.createTask("", "Descrição válida")).rejects.toThrow("Tarefa sem título.");
      await expect(service.createTask("   ", "Descrição válida")).rejects.toThrow("Tarefa sem título.");
    });

    it("deve lançar erro quando descrição está vazia", async () => {
      await expect(service.createTask("Título válido", "")).rejects.toThrow("Tarefa sem descrição.");
      await expect(service.createTask("Título válido", "   ")).rejects.toThrow("Tarefa sem descrição.");
    });

    it("deve lançar erro quando título é undefined/null", async () => {
      await expect(service.createTask(undefined as any, "Descrição")).rejects.toThrow("Tarefa sem título.");
      await expect(service.createTask(null as any, "Descrição")).rejects.toThrow("Tarefa sem título.");
    });

    it("deve lançar erro quando descrição é undefined/null", async () => {
      await expect(service.createTask("Título", undefined as any)).rejects.toThrow("Tarefa sem descrição.");
      await expect(service.createTask("Título", null as any)).rejects.toThrow("Tarefa sem descrição.");
    });
  });

  describe("updateTask", () => {
    beforeEach(async () => {
      const task: Task = { id: 1, title: "Tarefa Original", description: "Desc Original", completed: false };
      await mockRepository.save(task);
    });

    it("deve atualizar uma tarefa existente", async () => {
      const updatedTask: Task = { id: 1, title: "Tarefa Atualizada", description: "Desc Atualizada", completed: true };
      
      await service.updateTask(updatedTask);
      
      const task = await service.getTaskById(1);
      expect(task.title).toBe("Tarefa Atualizada");
      expect(task.description).toBe("Desc Atualizada");
      expect(task.completed).toBe(true);
    });

    it("deve aparar espaços em branco na atualização", async () => {
      const updatedTask: Task = { id: 1, title: "  Título atualizado  ", description: "  Desc atualizada  ", completed: false };
      
      await service.updateTask(updatedTask);
      
      const task = await service.getTaskById(1);
      expect(task.title).toBe("Título atualizado");
      expect(task.description).toBe("Desc atualizada");
    });

    it("deve lançar erro ao atualizar tarefa com título vazio", async () => {
      const invalidTask: Task = { id: 1, title: "", description: "Descrição válida", completed: false };
      
      await expect(service.updateTask(invalidTask)).rejects.toThrow("Tarefa sem título.");
    });

    it("deve lançar erro ao atualizar tarefa com descrição vazia", async () => {
      const invalidTask: Task = { id: 1, title: "Título válido", description: "", completed: false };
      
      await expect(service.updateTask(invalidTask)).rejects.toThrow("Tarefa sem descrição.");
    });

    it("deve lançar erro ao tentar atualizar tarefa inexistente", async () => {
      const nonExistentTask: Task = { id: 999, title: "Título", description: "Descrição", completed: false };
      
      await expect(service.updateTask(nonExistentTask)).rejects.toThrow("Tarefa não encontrada!");
    });
  });

  describe("deleteTask", () => {
    beforeEach(async () => {
      const task: Task = { id: 1, title: "Tarefa para deletar", description: "Descrição", completed: false };
      await mockRepository.save(task);
    });

    it("deve deletar uma tarefa existente", async () => {
      await service.deleteTask(1);
      
      const tasks = await service.getAllTasks();
      expect(tasks).toHaveLength(0);
    });

    it("deve lançar erro ao tentar deletar tarefa inexistente", async () => {
      await expect(service.deleteTask(999)).rejects.toThrow("Tarefa não encontrada!");
    });
  });

  describe("toggleTaskCompletion", () => {
    beforeEach(async () => {
      const task: Task = { id: 1, title: "Tarefa para toggle", description: "Descrição", completed: false };
      await mockRepository.save(task);
    });

    it("deve alterar tarefa incompleta para completa", async () => {
      await service.toggleTaskCompletion(1);
      
      const task = await service.getTaskById(1);
      expect(task.completed).toBe(true);
    });

    it("deve alterar tarefa completa para incompleta", async () => {
      // Primeiro marca como completa
      await service.toggleTaskCompletion(1);
      let task = await service.getTaskById(1);
      expect(task.completed).toBe(true);
      
      // Depois volta para incompleta
      await service.toggleTaskCompletion(1);
      task = await service.getTaskById(1);
      expect(task.completed).toBe(false);
    });

    it("deve lançar erro ao tentar toggle em tarefa inexistente", async () => {
      await expect(service.toggleTaskCompletion(999)).rejects.toThrow("Tarefa não encontrada!");
    });
  });

  describe("getCompletedTasks", () => {
    beforeEach(async () => {
      const task1: Task = { id: 1, title: "Tarefa 1", description: "Desc 1", completed: true };
      const task2: Task = { id: 2, title: "Tarefa 2", description: "Desc 2", completed: false };
      const task3: Task = { id: 3, title: "Tarefa 3", description: "Desc 3", completed: true };
      
      await mockRepository.save(task1);
      await mockRepository.save(task2);
      await mockRepository.save(task3);
    });

    it("deve retornar apenas tarefas completadas", async () => {
      const completedTasks = await service.getCompletedTasks();
      
      expect(completedTasks).toHaveLength(2);
      expect(completedTasks.every(task => task.completed)).toBe(true);
      expect(completedTasks.map(t => t.title)).toEqual(["Tarefa 1", "Tarefa 3"]);
    });

    it("deve retornar array vazio quando não há tarefas completadas", async () => {
      mockRepository.clear();
      const task: Task = { id: 1, title: "Tarefa pendente", description: "Desc", completed: false };
      await mockRepository.save(task);
      
      const completedTasks = await service.getCompletedTasks();
      expect(completedTasks).toEqual([]);
    });
  });

  describe("getPendingTasks", () => {
    beforeEach(async () => {
      const task1: Task = { id: 1, title: "Tarefa 1", description: "Desc 1", completed: true };
      const task2: Task = { id: 2, title: "Tarefa 2", description: "Desc 2", completed: false };
      const task3: Task = { id: 3, title: "Tarefa 3", description: "Desc 3", completed: false };
      
      await mockRepository.save(task1);
      await mockRepository.save(task2);
      await mockRepository.save(task3);
    });

    it("deve retornar apenas tarefas pendentes", async () => {
      const pendingTasks = await service.getPendingTasks();
      
      expect(pendingTasks).toHaveLength(2);
      expect(pendingTasks.every(task => !task.completed)).toBe(true);
      expect(pendingTasks.map(t => t.title)).toEqual(["Tarefa 2", "Tarefa 3"]);
    });

    it("deve retornar array vazio quando não há tarefas pendentes", async () => {
      mockRepository.clear();
      const task: Task = { id: 1, title: "Tarefa completa", description: "Desc", completed: true };
      await mockRepository.save(task);
      
      const pendingTasks = await service.getPendingTasks();
      expect(pendingTasks).toEqual([]);
    });
  });
});