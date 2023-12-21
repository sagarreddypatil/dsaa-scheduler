import { useNavigate } from "react-router-dom";
import Button from "../controls/button";
import { RuntimeTask } from "../types/task";

function TaskColorButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <button className={className}>{children}</button>;
}

export default function TaskCard({
  task,
  className,
  current,
  schedule,
  evict,
}: {
  task: RuntimeTask;
  className?: string;
  current: boolean;
  schedule?: () => void;
  evict?: () => void;
}) {
  const navigate = useNavigate();

  const TaskButton = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <button
        onClick={() => navigate(`/task/${task.id}`)}
        className={className}
      >
        {children}
      </button>
    );
  };

  return (
    <div
      className={`border border-black ${className} flex shadow-[5px_5px_0px_1px_rgba(0,0,0,0.5)]`}
    >
      <TaskColorButton
        className={`flex-none ${
          current ? "bg-yellow-400" : "bg-blue-300"
        } text-2xl w-12 text-center flex flex-col justify-center border-r border-black`}
      >
        {task.priority}
      </TaskColorButton>
      <TaskButton className="flex-none ps-2 pe-2 py-1">
        <h2 className="text-2xl font-bold">{task.title}</h2>
      </TaskButton>
      <TaskButton className="flex-auto flex items-center overflow-hidden pe-1">
        <p className="text-ellipsis overflow-hidden whitespace-nowrap">
          {task.description}
        </p>
      </TaskButton>
      <div className="flex-none">
        {schedule && (
          <Button
            onClick={schedule}
            className="bg-green-300 h-full w-24 shadow-none"
          >
            Schedule
          </Button>
        )}
        {evict && (
          <Button
            className="bg-red-300 h-full w-24 shadow-none"
            onClick={evict}
          >
            Evict
          </Button>
        )}
      </div>
    </div>
  );
}
