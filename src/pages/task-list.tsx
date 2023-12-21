import { useNavigate } from "react-router-dom";
import TaskCard from "../components/task-card";
import Button from "../controls/button";
import useTasks from "../useTasks";

export default function TaskList() {
  const { tasks, readyList, currentTask, schedule, evict } = useTasks();
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
          <TaskCard task={currentTask} evict={evict} current={true} />
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
            current={false}
          />
        );
      })}
    </div>
  );
}
