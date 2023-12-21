import { useNavigate } from "react-router-dom";
import TaskCard from "../components/task-card";
import { Button } from "../controls/button";
import useTasks from "../hooks/useTasks";
import { TaskStatus } from "../types/task";

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

  return (
    <div className="flex flex-col gap-3">
      <Button className="h-8 bg-purple-300" onClick={() => navigate("/create")}>
        + Create Task
      </Button>
      {currentTask && (
        <>
          <h2 className="text-2xl font-bold">Current Task</h2>
          <hr className="border-gray-500" />
          <TaskCard
            task={currentTask}
            evict={evict}
            current={true}
            finish={() => finish(currentTask.id)}
          />
          <div className="h-2"></div>
        </>
      )}
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
            current={false}
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
            current={false}
          />
        );
      })}
    </div>
  );
}
