import { useMemo } from "react";
import { RuntimeTask, StateChange, Task, TaskStatus } from "../types/task";
import { usePbRecords } from "./pocketbase";
import { pb } from "../Login";

export default function useTasks() {
  // const [_tasks, setTasks] = useState<Task[]>([]); // task table
  const [_tasks, _createTask, _updateTask] = usePbRecords<Task>("tasks");

  // const [stateChanges, setStateChanges] = useState<StateChange[]>([]); // state change table
  // const [_stateChanges, _addStateChange] =
  //   usePbRecords<StateChange>("stateChanges");

  // const stateChanges = useMemo(() => {
  //   if (!_stateChanges) return null;

  //   // convert timestamp to Date
  //   return _stateChanges.map((stateChange) => {
  //     return {
  //       ...stateChange,
  //       timestamp: new Date(stateChange.timestamp),
  //     };
  //   });
  // }, [_stateChanges]);

  const tasks: RuntimeTask[] | null = useMemo(() => {
    if (!_tasks) return null;

    // for each task, get the latest state change
    return _tasks.map((task) => {
      return {
        id: task.id!,
        ...task,
        status: task.status!,
        timestamp: new Date(task.timestamp!),
      };
    });
  }, [_tasks]);

  const readyList = useMemo(() => {
    if (!tasks) return [];
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
    if (!tasks) return null;
    return tasks.find((task) => task.status === TaskStatus.CURRENT) || null;
  }, [tasks]);

  const addStateChange = (taskId: string, status: TaskStatus) => {
    pb.collection("stateChanges").create<StateChange>({
      task: taskId,
      status: status,
      timestamp: new Date(),
      user: pb.authStore.model!.id,
    });

    // return _addStateChange({
    //   task: taskId,
    //   status: status,
    //   timestamp: new Date(),
    // });
  };

  const evict = () => {
    // make current task ready

    if (!currentTask) return Promise.resolve();
    return addStateChange(currentTask.id, TaskStatus.READY);
  };

  const schedule = (taskId: string) => {
    if (!tasks) return;
    const task = tasks.find((task) => task.id === taskId);
    if (!task) return;

    return evict()?.then(() => addStateChange(taskId, TaskStatus.CURRENT));
  };

  const finish = (taskId: string) => {
    // mark task as finished
    return addStateChange(taskId, TaskStatus.DONE);
  };

  const addTask = (task: Task) => {
    return _createTask(task).then((newTask) => {
      if (newTask && newTask.id) addStateChange(newTask.id, TaskStatus.READY);
    });
  };

  const updateTask = (task: Task) => {
    return _updateTask(task);
  };

  return {
    tasks,
    // stateChanges,
    readyList,
    currentTask,
    schedule,
    evict,
    finish,
    addStateChange,
    addTask,
    updateTask,
  };
}
