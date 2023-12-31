import { useNavigate } from "react-router-dom";
import { Button } from "../controls/button";
import { RuntimeTask, TaskStatus, defaultTaskColor } from "../types/task";
import { twMerge } from "tailwind-merge";
import { Select } from "../controls/select";
import { useEffect, useState } from "react";
import Textbox from "../controls/textbox";
import { pb } from "../Login";

function ActionButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className={twMerge("h-full w-24 shadow-none", className)}
    >
      {children}
    </Button>
  );
}

function hexToRgb(hex: string) {
  let bigint = parseInt(hex.substring(1), 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return [r, g, b];
}

export default function TaskCard({
  task,
  className,
  finish,
  schedule,
  evict,
  resurrect,
  showEdit,
}: {
  task: RuntimeTask;
  className?: string;
  finish?: () => void;
  schedule?: () => void;
  evict?: () => void;
  resurrect?: () => void;
  showEdit?: boolean;
}) {
  const navigate = useNavigate();

  const [editName, setEditName] = useState(false);
  const [newTitle, setNewTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!editName && newTitle !== null) {
      // update task title
      pb.collection("tasks").update(task.id, { title: newTitle });
      setNewTitle(null);
    }
  }, [editName]);

  const TaskButton = ({
    style,
    children,
    className,
  }: {
    style?: React.CSSProperties;
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <button
        style={style}
        onClick={() => navigate(`/task/${task.id}`)}
        className={className}
      >
        {children}
      </button>
    );
  };

  const finishButton = finish ? (
    <ActionButton onClick={finish} className="bg-green-300">
      Finish
    </ActionButton>
  ) : (
    <></>
  );

  const resurrectButton = resurrect ? (
    <ActionButton onClick={resurrect} className="bg-gray-300">
      Resurrect
    </ActionButton>
  ) : (
    <></>
  );

  const scheduleButton = schedule ? (
    <ActionButton onClick={schedule} className="bg-blue-300">
      Schedule
    </ActionButton>
  ) : (
    <></>
  );

  const evictButton = evict ? (
    <ActionButton onClick={evict} className="bg-red-300">
      Evict
    </ActionButton>
  ) : (
    <></>
  );

  const editButton = showEdit ? (
    <Select
      className="h-full w-24 shadow-none"
      selected={editName}
      onClick={() => setEditName((cur) => !cur)}
    >
      Rename
    </Select>
  ) : (
    <></>
  );

  const anyButtons = finish || schedule || evict || resurrect;

  const renderButtons = () => {
    if (showEdit) return <div className="flex flex-col h-10">{editButton}</div>;

    if (!anyButtons) return <></>;
    switch (task.status) {
      case TaskStatus.READY:
        return <div className="flex flex-col h-10">{scheduleButton}</div>;
      case TaskStatus.CURRENT:
        return <div className="flex flex-col h-10">{finishButton}</div>;
      case TaskStatus.DONE:
        return <div className="flex flex-col h-10">{resurrectButton}</div>;
      default:
        return <></>;
    }
  };

  const color =
    task.color == null || task.color == "" ? defaultTaskColor : task.color;

  const [r, g, b] = hexToRgb(color);
  // https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
  const foregroundBlack = r * 0.299 + g * 0.587 + b * 0.114 > 186;
  const foregroundColor = foregroundBlack ? "#000" : "#fff";

  const statusColors = {
    [TaskStatus.READY]: "",
    [TaskStatus.CURRENT]: "bg-orange-300",
    [TaskStatus.DONE]: "bg-gray-400",
    [TaskStatus.SLEEP]: "bg-yellow-300",
  };

  return (
    <div
      className={`border border-black ${className} flex shadow-[3px_3px_0px_1px_rgba(0,0,0,0.5)]`}
    >
      <TaskButton
        className="flex-none text-2xl w-12 text-center flex items-center justify-center border-r border-black "
        style={{ backgroundColor: color, color: foregroundColor }}
      >
        {task.priority}
      </TaskButton>
      {editName ? (
        <Textbox
          className="flex-1"
          defaultValue={task.title}
          onChange={(title) => setNewTitle(title)}
        />
      ) : (
        <TaskButton
          className={`flex-1 ps-2 pe-2 py-1 overflow-hidden ${
            statusColors[task.status]
          }`}
        >
          <h2
            className={`text-xl ${
              anyButtons
                ? "overflow-hidden whitespace-nowrap text-ellipsis"
                : ""
            }`}
          >
            {task.title}
          </h2>
        </TaskButton>
      )}
      {renderButtons()}
    </div>
  );
}
