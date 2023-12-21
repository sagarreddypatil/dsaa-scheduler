import { useEffect, useMemo, useState } from "react";
import { Task, TaskStatus, StateChange, RuntimeTask } from "./types/task";
import Button from "./controls/button";
import TaskCard from "./components/task-card";
import useTasks from "./useTasks";

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
  const { tasks, readyList, currentTask, schedule, evict } = useTasks();

  return (
    <div className="flex flex-col gap-4">
      {currentTask && (
        <>
          <h2 className="text-2xl font-bold">Current Task</h2>
          <TaskCard task={currentTask} evict={evict} current={true} />
        </>
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
