import React from "react";
import { cn } from "../../utils/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", className)}
      {...props}
    />
  );
};
