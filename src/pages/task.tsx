import { useParams } from "react-router-dom";
import useTasks from "../hooks/useTasks";
import TaskCard from "../components/task-card";
import { TaskStatus, defaultTaskColor } from "../types/task";
import { HexColorPicker } from "react-colorful";
import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";

// from https://github.com/Chalarangelo/30-seconds-of-code/blob/master/content/snippets/js/s/format-duration.md
const formatDuration = (ms: number) => {
  if (ms < 0) ms = -ms;
  const time = {
    day: Math.floor(ms / 86400000),
    hour: Math.floor(ms / 3600000) % 24,
    minute: Math.floor(ms / 60000) % 60,
    second: Math.floor(ms / 1000) % 60,
    millisecond: Math.floor(ms) % 1000,
  };
  return Object.entries(time)
    .filter((val) => val[1] !== 0)
    .map(([key, val]) => `${val} ${key}${val !== 1 ? "s" : ""}`)
    .join(", ");
};

export default function Task() {
  const { tasks, stateChanges, updateTask } = useTasks();
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

  const taskChanges = stateChanges
    .filter((change) => change.task === task.id)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const oldestChange = taskChanges[0];
  const latestChange = taskChanges[taskChanges.length - 1];

  let timeSpent = 0;
  let previousChange = oldestChange;

  for (let i = 0; i < taskChanges.length; i++) {
    const change = taskChanges[i];
    if (
      previousChange.status === TaskStatus.CURRENT &&
      change.status !== TaskStatus.CURRENT
    ) {
      timeSpent +=
        change.timestamp.getTime() - previousChange.timestamp.getTime();
    }

    previousChange = change;
  }

  timeSpent = Math.round(timeSpent / 1000);

  const prettyDuration = formatDuration(timeSpent * 1000);

  const totalInterval =
    latestChange.timestamp.getTime() - oldestChange.timestamp.getTime();
  const daysSpent = Math.ceil(totalInterval / (1000 * 60 * 60 * 24));

  const timePerDay = Math.round(timeSpent / daysSpent);
  const timePerWeek = timePerDay * 7;

  const timePerWeekPretty = formatDuration(timePerWeek * 1000);

  return (
    <div className="flex flex-col gap-3">
      <TaskCard task={task} />
      <div className="h-2"></div>
      <h2 className="text-2xl font-bold">Description</h2>
      {task.description}
      <h2 className="text-2xl font-bold">Statistics</h2>
      You started this task at {oldestChange.timestamp.toLocaleString()}
      <div className="-my-1" />
      {task.status === TaskStatus.CURRENT
        ? "You are currently working on this task"
        : `You last worked on this task at ${latestChange.timestamp.toLocaleString()}`}
      <div className="-my-1" />
      You've spent {prettyDuration} on this task, over the course of {daysSpent}{" "}
      day{daysSpent !== 1 ? "s" : ""}
      <div className="-my-1" />
      On average, that's {timePerWeekPretty} per week
      <h2 className="text-2xl font-bold">Pick Color</h2>
      <HexColorPicker
        className="task-color-picker"
        color={color}
        onChange={setColor}
      />
    </div>
  );
}
