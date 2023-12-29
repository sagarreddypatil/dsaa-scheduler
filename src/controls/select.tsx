import { useId } from "react";
import { twMerge } from "tailwind-merge";

export function Select({
  children,
  onClick,
  selected,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}) {
  const id = useId();

  return (
    <div className="flex flex-1">
      <input
        type="checkbox"
        id={id}
        className="peer hidden"
        checked={selected}
        onChange={() => onClick && onClick()}
      />
      <label
        htmlFor={id}
        className={twMerge(
          "flex flex-row flex-1 items-center justify-center align-middle rounded-none outline outline-1 outline-black peer-checked:bg-black peer-checked:text-white text-normal px-4 text-lg shadow-[3px_3px_0px_1px_rgba(0,0,0,0.5)]",
          className ? className : ""
        )}
      >
        {children}
      </label>
    </div>
  );
}
