import { forwardRef } from "react";

type TextboxProps = {
  placeholder?: string;
  password?: boolean;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
};

const Textbox = forwardRef<HTMLInputElement, TextboxProps>(
  ({ placeholder, type, value, onChange }, ref) => {
    return (
      <input
        ref={ref}
        type={type ? type : "text"}
        placeholder={placeholder}
        value={value}
        className="border border-black text-xl rounded-none p-1"
        onChange={(e) => (onChange ? onChange(e.target.value) : null)}
      />
    );
  }
);

export default Textbox;
