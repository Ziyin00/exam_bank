import { cn } from "@/src/lib/utils";
import React from "react";

interface BadgeProps {
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200": variant === "default",
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200": variant === "secondary",
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200": variant === "destructive",
          "border border-gray-200 bg-transparent dark:border-gray-600": variant === "outline",
        },
        className
      )}
    >
      {children}
    </div>
  );
}