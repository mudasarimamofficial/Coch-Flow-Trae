import type { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  label?: string;
};

export function Textarea({ label, error, className = "", ...props }: Props) {
  return (
    <label className="flex flex-col gap-2">
      {label ? (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
      ) : null}
      <textarea
        className={`rounded-lg bg-slate-50 p-4 text-slate-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#0fa3a3] dark:bg-white/5 dark:text-white dark:ring-white/10 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </label>
  );
}

