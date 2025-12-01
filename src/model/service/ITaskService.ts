import { Task } from "../entities/task";

export interface ITaskService {
    getAllTasks(): Promise<Task[]>;
    getTaskById(id: number): Promise<Task>;
    createTask(title: string, description: string): Promise<void>;
    updateTask(task: Task): Promise<void>;
    deleteTask(id: number): Promise<void>;
    toggleTaskCompletion(id: number): Promise<void>;
    getCompletedTasks(): Promise<Task[]>;
    getPendingTasks(): Promise<Task[]>;
}