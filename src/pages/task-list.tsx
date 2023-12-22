import { useNavigate } from "react-router-dom";
import TaskCard from "../components/task-card";
import { Button } from "../controls/button";
import useTasks from "../hooks/useTasks";
import { TaskStatus } from "../types/task";
import Textbox from "../controls/textbox";

export default function TaskList() {
  const {
    tasks,
    readyList,
    currentTask,
    schedule,
    evict,
    finish,
    addStateChange,
  } = useTasks();
  const navigate = useNavigate();

  const setNotifyInterval = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "default") return;

    // send to service worker
    navigator.serviceWorker.controller?.postMessage({
      type: "setNotifyInterval",
      interval: parseInt(value),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4">
        <Button
          className="h-10 bg-purple-300 flex-1"
          onClick={() => navigate("/create")}
        >
          + Create Task
        </Button>
        <Button className="h-10 bg-green-300 flex-1" onClick={() => evict()}>
          Idle
        </Button>
        <select
          className="rounded-none outline outline-1 outline-black h-10 px-4 text-lg shadow-[3px_3px_0px_1px_rgba(0,0,0,0.5)]"
          onChange={setNotifyInterval}
        >
          <option value="default">Notification Interval</option>
          <option value="15">15m</option>
          <option value="30">30m</option>
          <option value="60">1h</option>
          <option value="120">2h</option>
          <option value="240">4h</option>
        </select>
      </div>
      <h2 className="text-2xl font-bold">Current Task</h2>
      <hr className="border-gray-500" />
      {currentTask ? (
        <TaskCard
          task={currentTask}
          evict={evict}
          finish={() => finish(currentTask.id)}
        />
      ) : (
        // there's always a current task
        <TaskCard
          task={{
            id: "idle",
            title: "Idle",
            description: "",
            priority: 0,
            status: TaskStatus.CURRENT,
            timestamp: new Date(),
            color: "#fff",
          }}
        />
      )}
      <div className="h-2"></div>
      <h2 className="text-2xl font-bold">Ready to do</h2>
      <hr className="border-gray-500" />
      {readyList.map((taskId) => {
        const task = tasks.find((task) => task.id === taskId);
        if (!task) return;
        return (
          <TaskCard
            task={task}
            key={task.id}
            schedule={() => schedule(taskId)}
            finish={() => finish(taskId)}
          />
        );
      })}
      <div className="h-2"></div>
      <h2 className="text-2xl font-bold">Done</h2>
      <hr className="border-gray-500" />
      {tasks.map((task) => {
        if (!task) return;
        if (task.status !== TaskStatus.DONE) return;
        return (
          <TaskCard
            task={task}
            key={task.id}
            schedule={() => schedule(task.id)}
            resurrect={() => addStateChange(task.id, TaskStatus.READY)}
          />
        );
      })}
    </div>
  );
}
