import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type TextboxProps = {
  placeholder?: string;
  password?: boolean;
  type?: string;
  defaultValue?: string;
  value?: string;
  className?: string;
  onChange?: (value: string) => void;
};

const Textbox = forwardRef<HTMLInputElement, TextboxProps>(
  ({ placeholder, type, defaultValue, value, className, onChange }, ref) => {
    return (
      <input
        ref={ref}
        type={type ? type : "text"}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        className={twMerge(
          "border border-black text-xl rounded-none p-1",
          className ? className : ""
        )}
        onChange={(e) => (onChange ? onChange(e.target.value) : null)}
      />
    );
  }
);

export default Textbox;
