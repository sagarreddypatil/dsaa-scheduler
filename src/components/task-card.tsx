import { useNavigate } from "react-router-dom";
import { Button } from "../controls/button";
import { RuntimeTask, TaskStatus, defaultTaskColor } from "../types/task";
import { twMerge } from "tailwind-merge";

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

export default function TaskCard({
  task,
  className,
  finish,
  schedule,
  evict,
  resurrect,
}: {
  task: RuntimeTask;
  className?: string;
  finish?: () => void;
  schedule?: () => void;
  evict?: () => void;
  resurrect?: () => void;
}) {
  const navigate = useNavigate();

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

  const anyButtons = finish || schedule || evict || resurrect;

  const renderButtons = () => {
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
        className="flex-none text-2xl w-12 text-center flex items-center justify-center border-r border-black"
        style={{ backgroundColor: color }}
      >
        {task.priority}
      </TaskButton>
      <TaskButton
        className={`flex-1 ps-2 pe-2 py-1 overflow-hidden ${
          statusColors[task.status]
        }`}
      >
        <h2
          className={`text-xl ${
            anyButtons ? "overflow-hidden whitespace-nowrap text-ellipsis" : ""
          }`}
        >
          {task.title}
        </h2>
      </TaskButton>
      {renderButtons()}
    </div>
  );
}
