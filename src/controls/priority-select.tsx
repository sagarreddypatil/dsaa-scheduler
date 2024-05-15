const MIN_PRIORITY = 0;
const MAX_PRIORITY = 31;

type PrioritySelectProps = {
  prefix?: boolean;
  value: number;
  onChange: (newVal: number) => void;
};

export default function PrioritySelect({
  prefix,
  value,
  onChange,
}: PrioritySelectProps) {
  return (
    <select
      className="border border-black text-xl rounded-none p-1 bg-white"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
    >
      {Array.from(
        { length: MAX_PRIORITY - MIN_PRIORITY + 1 },
        (_, i) => i + MIN_PRIORITY
      ).map((i) => (
        <option value={i} key={i}>
          {prefix ? "Priority " : ""}
          {i}
        </option>
      ))}
    </select>
  );
}
