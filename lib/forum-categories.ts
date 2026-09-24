export const FORUM_CATEGORIES = [
  "General chat",
  "Sleep & routines",
  "Feeding & weaning",
  "Gear recommendations",
  "Days out & milestones",
] as const;

export type ForumCategory = (typeof FORUM_CATEGORIES)[number];
