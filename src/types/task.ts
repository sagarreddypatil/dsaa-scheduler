export enum TaskStatus {
  SLEEP = "SLEEP",
  READY = "READY",
  CURRENT = "CURRENT",
  DONE = "DONE",
}

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: number;
};
