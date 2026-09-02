import { useState } from "react";

export interface Option<T = string> {
  value: T;
  label: string;
}

export interface SelectProps<T = string> {
  options: Option<T>[];
  placeholder?: string;
  onChange: (value: T) => void;
  className?: string;
  defaultValue?: T;
  value?: T; // ✅ Added to support controlled component
}

function Select<T = string>({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue,
  value,
}: SelectProps<T>) {
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);

  const selected = value ?? internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = e.target.selectedIndex;
    const selectedOption = options[selectedIndex - 1]; // Adjust for placeholder
    if (selectedOption) {
      if (value === undefined) {
        setInternalValue(selectedOption.value); // Uncontrolled mode
      }
      onChange(selectedOption.value);
    }
  };

  return (
    <select
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
        selected ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={String(selected ?? "")}
      onChange={handleChange}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={String(option.value)} value={String(option.value)}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
