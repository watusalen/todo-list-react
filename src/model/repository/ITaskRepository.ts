import { Task } from "../entities/task";

export interface IRepository {
    findAll(): Promise<Array<Task>>;
    findById(id: number): Promise<Task>;
    save(task: Task): Promise<void>;
    update(task: Task): Promise<void>;
    delete(id: number): Promise<void>;
}