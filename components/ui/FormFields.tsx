import { InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full rounded border border-mb-gray-100 bg-white px-3 py-2 text-sm text-mb-navy placeholder:text-mb-gray-400 focus:border-mb-cyan focus:outline-none focus:ring-1 focus:ring-mb-cyan ${className}`}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className = "", ...props }, ref) => (
  <select
    ref={ref}
    className={`w-full rounded border border-mb-gray-100 bg-white px-3 py-2 text-sm text-mb-navy focus:border-mb-cyan focus:outline-none focus:ring-1 focus:ring-mb-cyan ${className}`}
    {...props}
  />
));
Select.displayName = "Select";

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-mb-navy">
      {children}
    </label>
  );
}
