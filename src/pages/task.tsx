import { useNavigate, useParams } from "react-router-dom";
import useTasks from "../hooks/useTasks";
import TaskCard from "../components/task-card";
import { TaskStatus, defaultTaskColor } from "../types/task";
import { HexColorPicker } from "react-colorful";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "usehooks-ts";
import { Button } from "../controls/button";
import { pb } from "../Login";
import Textbox from "../controls/textbox";
import Markdown from "react-markdown";
import { Select } from "../controls/select";

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
  const navigate = useNavigate();

  const { tasks, stateChanges, updateTask } = useTasks();
  const [editDesc, setEditDesc] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const { id } = useParams();

  const [color, setColor] = useState(defaultTaskColor);
  const debouncedColor = useDebounce(color, 500);

  const _task = tasks && tasks.find((task) => task.id === id);

  useEffect(() => {
    if (editDesc) {
      setNewDesc(_task?.description ?? "");
      return;
    }

    // update task description
    if (!_task) return;

    if (newDesc === undefined) return;

    updateTask({ ..._task, description: newDesc });
  }, [editDesc]);

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

  if (!stateChanges) return <></>;

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

  const deleteTask = () => {
    const resp = confirm(
      "Are you sure you want to delete this task? This is permanent and cannot be undone."
    );
    if (!resp) return;

    pb.collection("tasks")
      .delete(task.id)
      .then(() => {
        navigate("/");
      });
  };

  return (
    <div className="flex flex-col gap-3">
      <TaskCard task={task} showEdit={true} />
      <div className="h-2"></div>
      <div className="flex flex-row">
        <h2 className="text-2xl font-bold flex-1">Description</h2>
        <Select selected={editDesc} onClick={() => setEditDesc((val) => !val)}>
          Edit Description
        </Select>
      </div>
      <hr className="border-gray-500" />
      {editDesc ? (
        <textarea
          className="p-2 border border-black rounded-none text-lg"
          defaultValue={task.description}
          onChange={(e) => setNewDesc(e.target.value)}
          onInput={(e) => {
            e.currentTarget.style.height = "";
            e.currentTarget.style.height = `${
              e.currentTarget.scrollHeight + 10
            }px`;
          }}
          onFocus={(e) => {
            e.currentTarget.style.height = "";
            e.currentTarget.style.height = `${
              e.currentTarget.scrollHeight + 10
            }px`;
          }}
        />
      ) : (
        <div
          className={
            "prose prose-neutral prose-hr:my-2 prose-headings:mt-6 prose-headings:mb-2\
             prose-p:my-0 prose-ul:m-0 prose-h1:text-3xl prose-h1:font-normal\
             prose-h2:text-2xl prose-hr:border-gray-500 text-black"
          }
        >
          <Markdown>{task.description}</Markdown>
        </div>
      )}
      <h2 className="text-2xl font-bold">Statistics</h2>
      <hr className="border-gray-500" />
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
      <hr className="border-gray-500" />
      <HexColorPicker
        className="task-color-picker"
        color={color}
        onChange={setColor}
      />
      <div className="h-2"></div>
      <h2 className="text-2xl font-bold">Task Priority</h2>
      <hr className="border-gray-500" />
      <Textbox
        placeholder="Priority"
        value={task.priority.toString()}
        onChange={(newVal) => {
          const priority = parseInt(newVal);
          if (isNaN(priority)) return;
          updateTask({ ...task, priority });
        }}
        type="number"
      />
      {/* <div className="h-2"></div>
      <Button
        className="outline-red-500 text-red-500 hover:bg-red-500 h-8"
        onClick={deleteTask}
      >
        Delete Permanently
      </Button> */}
    </div>
  );
}
