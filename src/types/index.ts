export type NecessityLevel = "high" | "medium" | "low";

export type Palette = {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
};

export type Home = {
  id: string;
  ownerId: string;
  name: string;
  members: string[];
  pendingInvites?: string[];
  palette: Palette;
  createdAt?: unknown;
};

export type Room = {
  id: string;
  homeId?: string;
  name: string;
  order: number;
  createdAt?: unknown;
};

export type ChecklistItem = {
  id: string;
  homeId?: string;
  roomId: string;
  name: string;
  necessityLevel: NecessityLevel;
  done: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type Share = {
  id: string;
  homeId: string;
  createdBy: string;
  mode: "readonly";
  roomsIncluded: string[];
  createdAt?: unknown;
};
