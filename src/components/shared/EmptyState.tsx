import React from "react";
import { Button } from "../ui/Button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-start gap-3 rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-left">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
