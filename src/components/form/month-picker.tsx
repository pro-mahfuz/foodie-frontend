import { useEffect } from "react";
import flatpickr from "flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/flatpickr.css";
import "flatpickr/dist/plugins/monthSelect/style.css"; // 👈 add plugin CSS
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: (selectedDates: Date[], dateStr: string) => void;
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
};

export default function MonthPicker({
  id,
  mode = "single",
  onChange,
  defaultDate,
  label,
  placeholder,
}: PropsType) {
  useEffect(() => {
    const flatPickrInstance = flatpickr(`#${id}`, {
      mode,
      static: true,
      dateFormat: "Y-m", // 👈 YYYY-MM format
      defaultDate,
      plugins: [
        monthSelectPlugin({
          shorthand: true, // shows "Sep" instead of "September"
          dateFormat: "Y-m", // value stored
          altFormat: "F Y", // what user sees (e.g. September 2025)
        }),
      ],
      onChange: (selectedDates, dateStr) => {
        if (onChange) onChange(selectedDates, dateStr);
      },
    });

    return () => {
      if (!Array.isArray(flatPickrInstance)) {
        flatPickrInstance.destroy();
      }
    };
  }, [id, mode, defaultDate, onChange]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
