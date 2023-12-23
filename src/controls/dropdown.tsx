import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface DropdownProps {
  name: React.ReactNode;
  children?: React.ReactNode;
  right?: boolean;
}

export function Dropdown(props: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="rounded-none"
          onClick={(e) => {
            // focus this button
            e.currentTarget.focus();
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          {props.name}
        </button>
      </div>
      <div
        className={`absolute ${
          props.right ? "right-0" : ""
        } w-44 rounded-none bg-white shadow-lg ring-1 ring-black ring-opacity-30 focus:outline-none`}
        hidden={!open}
      >
        <div className="">{props.children}</div>
      </div>
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function DropdownItem(props: DropdownItemProps) {
  const classes =
    "text-black block w-full text-left px-2 py-1 text-md hover:bg-black hover:text-white hover:font-bold focus:bg-gray-200";
  const activeClases = "bg-rush-light font-bold text-black";
  const inactiveClasses = "";
  const _className = twMerge(
    classes,
    props.active ? activeClases : inactiveClasses
  );
  const className = twMerge(_className, props.className ? props.className : "");

  return (
    <button
      className={className}
      disabled={props.active}
      onMouseDown={(e) => {
        e.preventDefault();
        props.onClick && props.onClick();
      }}
    >
      {props.children}
    </button>
  );
}
