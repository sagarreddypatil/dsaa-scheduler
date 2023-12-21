import { useParams } from "react-router-dom";
import useTasks from "../hooks/useTasks";
import TaskCard from "../components/task-card";
import { defaultTaskColor } from "../types/task";
import { HexColorPicker } from "react-colorful";
import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";

export default function Task() {
  const { tasks, updateTask } = useTasks();
  const { id } = useParams();

  const [color, setColor] = useState(defaultTaskColor);
  const debouncedColor = useDebounce(color, 500);

  const _task = tasks.find((task) => task.id === id);

  useEffect(() => {
    if (_task?.color) setColor(_task.color);
  }, [tasks]);

  useEffect(() => {
    // update task color
    if (!_task) return;
    updateTask({ ..._task, color: color ?? defaultTaskColor });
  }, [debouncedColor]);

  if (!_task) return <h1>Task not found</h1>;
  const task = { ..._task, color: color };

  return (
    <div className="flex flex-col gap-3">
      <TaskCard task={task} />
      <div className="h-2"></div>
      <h2 className="text-2xl font-bold">Description</h2>
      {task.description}
      <h2 className="text-2xl font-bold">Pick Color</h2>
      <HexColorPicker
        className="task-color-picker"
        color={color}
        onChange={setColor}
      />
    </div>
  );
}
