import { useEffect, useMemo, useState } from "react";
import { Task, TaskStatus, StateChange, RuntimeTask } from "./types/task";

export default function App() {
  return (
    <div className="my-4 max-w-xl mx-auto">
      <div className="flex flex-row justify-between mb-2">
        <h1 className="text-2xl">schd</h1>
        <div className="flex flex-col justify-center">
          <Button>Create Task</Button>
        </div>
      </div>
      <hr className="border-gray-500" />
      <br className="h-2" />
      <TaskList />
    </div>
  );
}

function TaskList() {
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

  return (
    <div className="flex flex-col gap-4">
      {currentTask && (
        <TaskCard task={currentTask} evict={evict} current={true} />
      )}
      {readyList.map((taskId) => {
        const task = tasks.find((task) => task.id === taskId);
        if (!task) return;
        return (
          <TaskCard
            task={task}
            key={task.id}
            schedule={() => schedule(taskId)}
            current={false}
          />
        );
      })}
    </div>
  );
}

function TaskCard({
  task,
  className,
  current,
  schedule,
  evict,
}: {
  task: RuntimeTask;
  className?: string;
  current: boolean;
  schedule?: () => void;
  evict?: () => void;
}) {
  return (
    <div
      className={`border border-black ${className} flex shadow-[5px_5px_0px_1px_rgba(0,0,0,0.5)]`}
    >
      <div
        className={`flex-none ${
          current ? "bg-yellow-300" : "bg-blue-300"
        } text-2xl w-12 text-center flex flex-col justify-center border-r border-black`}
      >
        {task.priority}
      </div>
      <div className="flex-none ps-2 pe-2 py-1">
        <h2 className="text-2xl font-bold">{task.title}</h2>
      </div>
      <div className="flex-auto flex items-center overflow-hidden pe-1">
        <p className="text-ellipsis overflow-hidden whitespace-nowrap">
          {task.description}
        </p>
      </div>
      <div className="flex-none">
        {schedule && (
          <Button
            onClick={schedule}
            className="bg-green-300 h-full w-24 shadow-none"
          >
            Schedule
          </Button>
        )}
        {evict && (
          <Button
            className="bg-red-300 h-full w-24 shadow-none"
            onClick={evict}
          >
            Evict
          </Button>
        )}
      </div>
    </div>
  );
}

function Button({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-row items-center justify-center align-middle rounded-none outline outline-1 outline-black hover:bg-black hover:text-white text-normal px-4 text-lg shadow-[3px_3px_0px_1px_rgba(0,0,0,0.5)] ${className}`}
    >
      {children}
    </button>
  );
}
