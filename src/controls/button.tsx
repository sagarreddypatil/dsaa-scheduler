import { twMerge } from "tailwind-merge";

export function Button({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={twMerge(
        "flex flex-row items-center justify-center align-middle rounded-none outline outline-1 outline-black hover:bg-black hover:text-white text-normal px-4 text-lg shadow-[3px_3px_0px_1px_rgba(0,0,0,0.5)]",
        className ? className : ""
      )}
    >
      {children}
    </button>
  );
}

export function Submit({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <input
      type="submit"
      className={twMerge(
        "flex flex-row items-center justify-center align-middle rounded-none outline outline-1 outline-black hover:bg-black hover:text-white text-normal px-4 text-lg shadow-[3px_3px_0px_1px_rgba(0,0,0,0.5)]",
        className ? className : ""
      )}
      value={children as string}
    />
  );
}
