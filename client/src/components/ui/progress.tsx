import * as Progress from "@radix-ui/react-progress";

interface ProgressProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressProps) {
  return (
    <Progress.Root 
      className={`relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}
      value={value}
    >
      <Progress.Indicator
        className="h-full w-full bg-blue-500 transition-all duration-300 ease-out dark:bg-blue-400"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </Progress.Root>
  );
}