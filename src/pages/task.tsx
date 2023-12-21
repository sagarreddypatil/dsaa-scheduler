import { useParams } from "react-router-dom";
import useTasks from "../hooks/useTasks";
import TaskCard from "../components/task-card";
import { TaskStatus } from "../types/task";

export default function Task() {
  const { tasks } = useTasks();
  const { id } = useParams();

  const task = tasks.find((task) => task.id === id);
  if (!task) return <h1>Task not found</h1>;

  return (
    <div className="flex flex-col gap-3">
      <TaskCard task={task} current={task.status == TaskStatus.CURRENT} />
      {task.description}
    </div>
  );
}
