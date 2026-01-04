import React from "react";
import { cn } from "../../utils/cn";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "high" | "medium" | "low";
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

export const Badge = ({ className, tone = "medium", ...props }: BadgeProps) => {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", toneClasses[tone], className)}
      {...props}
    />
  );
};
