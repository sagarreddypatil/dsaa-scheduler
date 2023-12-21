import { useRef } from "react";
import Button from "../controls/button";
import Textbox from "../controls/textbox";
import useTasks from "../useTasks";
import { useNavigate } from "react-router-dom";

export default function CreateTask() {
  const { addTask } = useTasks();
  const navigate = useNavigate();

  const taskNameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const priorityRef = useRef<HTMLInputElement>(null);

  const createTask = () => {
    const taskName = taskNameRef.current?.value;
    const description = descriptionRef.current?.value;
    const priority = priorityRef.current?.value;

    if (!taskName || !description || !priority) return;

    addTask({
      title: taskName,
      description: description,
      priority: parseInt(priority),
    });

    navigate("/");
  };

  return (
    <div className="flex flex-col gap-3">
      <Textbox placeholder="Task name" ref={taskNameRef} />
      <textarea
        placeholder="Description"
        ref={descriptionRef}
        className="p-2 border border-black rounded-none text-lg"
      />
      <Textbox placeholder="Priority" ref={priorityRef} type="number" />
      <Button className="text-2xl py-1 bg-green-300" onClick={createTask}>
        Create
      </Button>
    </div>
  );
}
