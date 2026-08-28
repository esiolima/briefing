interface ProgressBarProps {
  steps: string[];
  currentStepIndex: number;
}

export function ProgressBar({ steps, currentStepIndex }: ProgressBarProps) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((step, index) => {
        const isDone = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        return (
          <li key={step} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`h-1.5 w-full rounded-full ${
                isDone || isCurrent ? "bg-mb-cyan" : "bg-mb-gray-100"
              }`}
            />
            <span
              className={`text-[11px] ${
                isCurrent
                  ? "font-semibold text-mb-navy"
                  : "text-mb-gray-400"
              }`}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
