import { Task } from "../../src/model/entities/task";

describe("Task Entity", () => {
  describe("Task Interface", () => {
    it("deve criar uma tarefa com todas as propriedades obrigatórias", () => {
        
      const task: Task = {
        id: 1,
        title: "Teste",
        description: "Descrição de teste",
        completed: false
      };

      expect(task.id).toBe(1);
      expect(task.title).toBe("Teste");
      expect(task.description).toBe("Descrição de teste");
      expect(task.completed).toBe(false);
    });

    it("deve permitir criar uma tarefa completada", () => {
      const task: Task = {
        id: 2,
        title: "Tarefa completada",
        description: "Esta tarefa foi completada",
        completed: true
      };

      expect(task.completed).toBe(true);
    });

    it("deve permitir modificar o status de completado", () => {
      const task: Task = {
        id: 3,
        title: "Tarefa modificável",
        description: "Esta tarefa terá seu status alterado",
        completed: false
      };

      expect(task.completed).toBe(false);
      
      task.completed = true;
      expect(task.completed).toBe(true);
    });

    it("deve permitir título e descrição vazios", () => {
      const task: Task = {
        id: 4,
        title: "",
        description: "",
        completed: false
      };

      expect(task.title).toBe("");
      expect(task.description).toBe("");
    });

    it("deve aceitar IDs negativos e zero", () => {
      const taskZero: Task = {
        id: 0,
        title: "ID Zero",
        description: "Tarefa com ID zero",
        completed: false
      };

      const taskNegative: Task = {
        id: -1,
        title: "ID Negativo",
        description: "Tarefa com ID negativo",
        completed: false
      };

      expect(taskZero.id).toBe(0);
      expect(taskNegative.id).toBe(-1);
    });
  });
});