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

export const SENIORITY_OPTIONS = [
  { label: "Entry", value: "entry" },
  { label: "Mid", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Executive", value: "executive" },
];

export const WEEKLY_CAPACITY_OPTIONS = [
  { label: "1–2h", value: "1-2h" },
  { label: "3–5h", value: "3-5h" },
  { label: "5+h", value: "5+h" },
];

export const TRANSFORMATION_EXPERIENCE_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Participated", value: "participated" },
  { label: "Led initiatives", value: "led_initiatives" },
  { label: "Enterprise-wide", value: "enterprise_wide" },
];
