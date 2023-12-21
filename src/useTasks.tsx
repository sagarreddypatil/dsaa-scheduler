import { useEffect, useMemo, useState } from "react";
import { RuntimeTask, StateChange, Task, TaskStatus } from "./types/task";

export default function useTasks() {
  const [_tasks, setTasks] = useState<Task[]>([
    {
      id: "A",
      title: "Some task",
      description:
        "This is an unreasonably long task description that is for the purposes of testing the layout of this application",
      priority: 1,
    },
    {
      id: "B",
      title: "Do this n dat",
      description: "This is task B",
      priority: 2,
    },
    {
      id: "C",
      title: "CS 381 HW",
      description: "This is task C",
      priority: 2,
    },
  ]); // task table

  const [stateChanges, setStateChanges] = useState<StateChange[]>([
    {
      id: "C",
      status: TaskStatus.READY,
      timestamp: new Date(),
    },
    {
      id: "B",
      status: TaskStatus.READY,
      timestamp: new Date(),
    },
    {
      id: "A",
      status: TaskStatus.READY,
      timestamp: new Date(),
    },
  ]); // state change table

  useEffect(() => {
    console.log(stateChanges);
  }, [stateChanges]);

  const tasks: RuntimeTask[] = useMemo(() => {
    // for each task, get the latest state change
    return _tasks.map((task) => {
      const stateChange = stateChanges
        .filter((stateChange) => stateChange.id === task.id)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      return {
        ...task,
        status: stateChange.status,
        timestamp: stateChange.timestamp,
      };
    });
  }, [_tasks, stateChanges]);

  const readyList = useMemo(() => {
    return tasks
      .filter((task) => task.status === TaskStatus.READY)
      .sort((a, b) => {
        // sort with priority, tiebreak with timestamp
        // i.e., lower priority first, oldest timestamp first
        if (a.priority === b.priority) {
          return a.timestamp.getTime() - b.timestamp.getTime();
        }

        return a.priority - b.priority;
      })
      .map((task) => task.id);
  }, [tasks]);

  const currentTask = useMemo(() => {
    return tasks.find((task) => task.status === TaskStatus.CURRENT);
  }, [tasks]);

  const addStateChange = (taskId: string, status: TaskStatus) => {
    setStateChanges((stateChanges) => {
      return [
        ...stateChanges,
        { id: taskId, status: status, timestamp: new Date() } as StateChange,
      ];
    });
  };

  const evict = () => {
    // make current task ready

    if (!currentTask) return;

    addStateChange(currentTask.id, TaskStatus.READY);
  };

  const schedule = (taskId: string) => {
    const task = tasks.find((task) => task.id === taskId);
    if (!task) return;

    evict();
    addStateChange(taskId, TaskStatus.CURRENT);
  };

  return {
    tasks,
    readyList,
    currentTask,
    schedule,
    evict,
  };
}
