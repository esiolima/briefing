import { HTMLAttributes } from "react";

type Tone = "neutral" | "info" | "success";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-mb-gray-100 text-mb-gray-400",
  info: "bg-mb-cyan/10 text-mb-cyan",
  success: "bg-mb-blue/10 text-mb-blue",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
