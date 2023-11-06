import { useState } from "react";
import { Task, TaskStatus } from "./types/task";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]); // task table
  const [readyList, setReadyList] = useState<string[]>([]); // list of task IDs

  const ready = (id: string) => {
    // ready a task

    // find the task
    const task = tasks.find((task) => task.id === id);
    if (!task) throw new Error(`Task ${id} not found`);

    // set status to ready
    task.status = TaskStatus.READY;

    if (readyList.includes(id)) return; // already in ready list

    // push to end of ready list
    setReadyList([...readyList, id]);
  };

  const evict = () => {
    // evict current task

    // get current task
    const currentTask = tasks.find(
      (task) => task.status === TaskStatus.CURRENT
    );

    if (!currentTask) return; // no current task

    // set status to ready
    currentTask.status = TaskStatus.READY;

    // push to end of ready list
    setReadyList([...readyList, currentTask.id]);
  };

  return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
}
