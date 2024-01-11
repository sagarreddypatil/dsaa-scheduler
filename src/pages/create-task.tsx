import { useRef, useState } from "react";
import { Button } from "../controls/button";
import Textbox from "../controls/textbox";
import useTasks from "../hooks/useTasks";
import { useNavigate } from "react-router-dom";
import PrioritySelect from "../controls/priority-select";

export default function CreateTask() {
  const { addTask } = useTasks();
  const navigate = useNavigate();

  const taskNameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  // const priorityRef = useRef<HTMLInputElement>(null);
  const [priority, setPriority] = useState<number>(1);

  const createTask = () => {
    const taskName = taskNameRef.current?.value;
    const description = descriptionRef.current?.value;
    // const priority = priorityRef.current?.value;

    if (!taskName || !priority) return;

    addTask({
      title: taskName,
      description: description || "",
      // priority: parseInt(priority),
      priority: priority,
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
      {/* <Textbox
        placeholder="Priority (lower is more urgent)"
        ref={priorityRef}
        type="number"
      /> */}
      <PrioritySelect prefix value={priority} onChange={setPriority} />
      <div className="flex flex-row gap-4">
        <Button
          className="font-bold py-1 bg-green-300 flex-1"
          onClick={createTask}
        >
          Create
        </Button>
        <Button
          className="h-10 flex-1 bg-gray-300"
          onClick={() => navigate("/")}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
