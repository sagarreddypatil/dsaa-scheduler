export enum TaskStatus {
  SLEEP = "SLEEP",
  READY = "READY",
  CURRENT = "CURRENT",
  DONE = "DONE",
}

export type Task = {
  id?: string; // optional for new tasks
  title: string;
  description: string;
  priority: number;
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
