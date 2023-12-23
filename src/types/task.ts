export enum TaskStatus {
  SLEEP = "SLEEP",
  READY = "READY",
  CURRENT = "CURRENT",
  DONE = "DONE",
}

export const defaultTaskColor = "#93c5fd";

export type Task = {
  id?: string; // optional for new tasks
  title: string;
  description: string;
  color?: string;
  priority: number;
  status?: TaskStatus;
  timestamp?: Date;
};

export type RuntimeTask = Task & {
  id: string; // required for runtime tasks
  status: TaskStatus;
  timestamp: Date;
};

export type StateChange = {
  id?: string; // useless
  task: string;
  status: TaskStatus;
  timestamp: Date;
};
