import { useNavigate } from "react-router-dom";
import TaskCard from "../components/task-card";
import { Button } from "../controls/button";
import useTasks from "../hooks/useTasks";
import { TaskStatus } from "../types/task";
import Textbox from "../controls/textbox";
import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { FaChevronDown, FaChevronLeft } from "react-icons/fa";

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
  const [doneCollapsed, setDoneCollapsed] = useLocalStorage(
    "doneCollapsed",
    true
  );

  const ButtonPanel = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Button
          className="h-10 bg-purple-300 flex-1 text-xl font-bold"
          onClick={() => navigate("/create")}
        >
          + Create Task
        </Button>
        <Button
          className="h-10 bg-green-300 flex-1 text-xl font-bold"
          onClick={() => evict()}
        >
          Idle
        </Button>
      </div>
    );
  };

  if (tasks === null) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ButtonPanel />
      <div className="h-2"></div>
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
            color: "#ffffff",
          }}
        />
      )}
      <div className="h-2"></div>
      <div className="flex flex-row">
        <h2 className="text-2xl font-bold flex-1">Ready to do</h2>
      </div>
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
      <button
        className="flex flex-row text-left items-center"
        onClick={() => setDoneCollapsed((old) => !old)}
      >
        <h2 className="text-2xl font-bold flex-1">Done</h2>
        <span className="flex justify-center items-center">
          <FaChevronDown />
        </span>
      </button>
      <hr className="border-gray-500" />
      {!doneCollapsed && (
        <>
          {tasks
            .filter((task) => task.status === TaskStatus.DONE)
            .sort((a, b) => {
              return b.timestamp.getTime() - a.timestamp.getTime();
            })
            .map((task) => {
              return (
                <TaskCard
                  task={task}
                  key={task.id}
                  schedule={() => schedule(task.id)}
                  resurrect={() => addStateChange(task.id, TaskStatus.READY)}
                />
              );
            })}
        </>
      )}
    </div>
  );
}
