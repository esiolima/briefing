import { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-mb-gray-100 bg-white p-6 shadow-soft ${className}`}
      {...props}
    />
  );
}
