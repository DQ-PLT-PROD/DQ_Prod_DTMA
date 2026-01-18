import type { RoleTrack } from "../services/learnerProfileService";

export const ROLE_OPTIONS: { label: string; value: RoleTrack }[] = [
  { label: "Digital Worker", value: "digital_worker" },
  { label: "Leader", value: "leader" },
];

export const GOAL_OPTIONS = [
  "Career growth",
  "Upskill quickly",
  "Lead teams better",
  "Improve productivity",
  "Learn AI/automation",
  "Prepare for promotion",
  "Build confidence",
  "Explore new topics",
];

export const PREFERENCE_OPTIONS = [
  "Data",
  "AI",
  "Automation",
  "Leadership",
  "Project management",
  "Communication",
  "Digital tools",
  "Strategy",
  "Innovation",
  "Operations",
  "Customer experience",
  "Finance",
];

export const MIN_GOALS = 3;
export const MAX_GOALS = 8;
export const MAX_PREFERENCES = 12;
