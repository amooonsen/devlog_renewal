import type { ReactNode } from "react";

interface CalloutProps {
  type?: "info" | "warning" | "error" | "success";
  children: ReactNode;
}

const styles = {
  info: "border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-300",
  warning:
    "border-yellow-500/30 bg-yellow-500/5 text-yellow-700 dark:text-yellow-300",
  error: "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300",
  success:
    "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-300",
};

const icons = {
  info: "ℹ️",
  warning: "⚠️",
  error: "🚨",
  success: "✅",
};

export function Callout({ type = "info", children }: CalloutProps) {
  return (
    <div
      className={`my-4 rounded-lg border-l-4 p-4 ${styles[type]}`}
      role="note"
    >
      <span className="mr-2">{icons[type]}</span>
      {children}
    </div>
  );
}
