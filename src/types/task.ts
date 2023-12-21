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
  priority: number;
};

export type RuntimeTask = Task & {
  status: TaskStatus;
  timestamp: Date;
};

export type StateChange = {
  id: string;
  status: TaskStatus;
  timestamp: Date;
};
