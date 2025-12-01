import { Task } from "../entities/task";
import { IRepository } from "../repository/ITaskRepository";
import { localTaskRepository } from "../repository/LocalTaskRepository";
import { ITaskService } from "./ITaskService";

export class TaskService implements ITaskService {
    private repository: IRepository;

    constructor(repository: IRepository) {
        this.repository = repository;
    }

    async getAllTasks(): Promise<Task[]> {
        return await this.repository.findAll();
    }

    async getTaskById(id: number): Promise<Task> {
        return await this.repository.findById(id);
    }

    async createTask(title: string, description: string): Promise<void> {
        if (!title || title.trim() === "") {
            throw new Error("Tarefa sem título.");
        }
        if (!description || description.trim() === "") {
            throw new Error("Tarefa sem descrição.");
        }

        const task: Task = {
            id: 0,
            title: title.trim(),
            description: description.trim(),
            completed: false
        };

        await this.repository.save(task);
    }

    async updateTask(task: Task): Promise<void> {
        if (!task.title || task.title.trim() === "") {
            throw new Error("Tarefa sem título.");
        }
        if (!task.description || task.description.trim() === "") {
            throw new Error("Tarefa sem descrição.");
        }

        await this.repository.findById(task.id);

        const updatedTask: Task = {
            ...task,
            title: task.title.trim(),
            description: task.description.trim()
        };

        await this.repository.update(updatedTask);
    }

    async deleteTask(id: number): Promise<void> {
        await this.repository.findById(id);
        await this.repository.delete(id);
    }

    async toggleTaskCompletion(id: number): Promise<void> {
        const task = await this.repository.findById(id);
        task.completed = !task.completed;
        await this.repository.update(task);
    }

    async getCompletedTasks(): Promise<Task[]> {
        const allTasks = await this.repository.findAll();
        return allTasks.filter(task => task.completed);
    }

    async getPendingTasks(): Promise<Task[]> {
        const allTasks = await this.repository.findAll();
        return allTasks.filter(task => !task.completed);
    }
}

export const localTaskService: TaskService = new TaskService(localTaskRepository);