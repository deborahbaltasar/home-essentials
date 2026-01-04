import type { ChecklistItem, NecessityLevel } from "../types";

export const necessityOrder: Record<NecessityLevel, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const sortItems = (items: ChecklistItem[], sortByStatus: boolean) => {
  return [...items].sort((a, b) => {
    if (sortByStatus && a.done !== b.done) {
      return a.done ? 1 : -1;
    }
    return necessityOrder[a.necessityLevel] - necessityOrder[b.necessityLevel];
  });
};
