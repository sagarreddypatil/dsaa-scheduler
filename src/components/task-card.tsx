import Button from "../controls/button";
import { RuntimeTask } from "../types/task";

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
  return (
    <div
      className={`border border-black ${className} flex shadow-[5px_5px_0px_1px_rgba(0,0,0,0.5)]`}
    >
      <div
        className={`flex-none ${
          current ? "bg-yellow-400" : "bg-blue-300"
        } text-2xl w-12 text-center flex flex-col justify-center border-r border-black`}
      >
        {task.priority}
      </div>
      <div className="flex-none ps-2 pe-2 py-1">
        <h2 className="text-2xl font-bold">{task.title}</h2>
      </div>
      <div className="flex-auto flex items-center overflow-hidden pe-1">
        <p className="text-ellipsis overflow-hidden whitespace-nowrap">
          {task.description}
        </p>
      </div>
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
