import type { SelectHTMLAttributes } from "react";

type Option = { value: string; label: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
  label?: string;
  options: Option[];
  placeholder?: string;
};

export function Select({ label, error, options, placeholder, className = "", ...props }: Props) {
  return (
    <label className="flex flex-col gap-2">
      {label ? (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
      ) : null}
      <select
        className={`h-12 rounded-lg bg-slate-50 px-4 text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-[#0fa3a3] dark:bg-white/5 dark:text-white dark:ring-white/10 ${className}`}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-slate-900">
            {o.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </label>
  );
}

