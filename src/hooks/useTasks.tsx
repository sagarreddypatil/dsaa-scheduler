import { useEffect, useMemo, useState } from "react";
import { RuntimeTask, StateChange, Task, TaskStatus } from "../types/task";
import { usePbRecords } from "./pocketbase";

export default function useTasks() {
  // const [_tasks, setTasks] = useState<Task[]>([]); // task table
  const [_tasks, _createTask] = usePbRecords<Task>("tasks");

  // const [stateChanges, setStateChanges] = useState<StateChange[]>([]); // state change table
  const [_stateChanges, _addStateChange] =
    usePbRecords<StateChange>("stateChanges");

  const stateChanges = useMemo(() => {
    if (!_stateChanges) return [] as StateChange[];

    // convert timestamp to Date
    return _stateChanges.map((stateChange) => {
      return {
        ...stateChange,
        timestamp: new Date(stateChange.timestamp),
      };
    });
  }, [_stateChanges]);

  const tasks: RuntimeTask[] = useMemo(() => {
    if (!_tasks) return [] as RuntimeTask[];

    // for each task, get the latest state change
    return _tasks.map((task) => {
      const stateChange = stateChanges
        .filter((stateChange) => stateChange.task === task.id)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

      if (!stateChange) {
        // shouldn't happen, but does. weird transient
        return {
          id: task.id!,
          ...task,
          status: TaskStatus.READY,
          timestamp: new Date(),
        };
      }

      return {
        id: task.id!, // to account for addTask
        ...task,
        status: stateChange.status,
        timestamp: stateChange.timestamp,
      };
    });
  }, [stateChanges]);

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
    return _addStateChange({
      task: taskId,
      status: status,
      timestamp: new Date(),
    });
  };

  const evict = () => {
    // make current task ready

    if (!currentTask) return Promise.resolve();
    return addStateChange(currentTask.id, TaskStatus.READY);
  };

  const schedule = (taskId: string) => {
    const task = tasks.find((task) => task.id === taskId);
    if (!task) return;

    return evict()?.then(() => addStateChange(taskId, TaskStatus.CURRENT));
  };

  const finish = (taskId: string) => {
    // mark task as finished
    return evict()?.then(() => addStateChange(taskId, TaskStatus.DONE));
  };

  const addTask = (task: Task) => {
    return _createTask(task).then((newTask) => {
      if (newTask && newTask.id) addStateChange(newTask.id, TaskStatus.READY);
    });
  };

  return {
    tasks,
    readyList,
    currentTask,
    schedule,
    evict,
    finish,
    addTask,
  };
}
