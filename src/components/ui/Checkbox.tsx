import React from "react";
import { cn } from "../../utils/cn";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = ({ className, ...props }: CheckboxProps) => {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-offset-0",
        className
      )}
      {...props}
    />
  );
};
