export const THEME_DEFS = [
  {
    label: "Compensation / Pay",
    color: "#e85d38",
    keywords: ["pay", "wage", "salary", "compensation", "comp", "rate", "hourly", "market", "industry standard", "afford", "money", "low offer", "low salary", "not enough", "underpay", "below market", "too low"],
  },
  {
    label: "Schedule / Hours",
    color: "#e8a838",
    keywords: ["schedule", "hours", "shift", "nights", "weekends", "onsite", "on-site", "full time", "part time", "flexibility", "flexible"],
  },
  {
    label: "Location / Remote",
    color: "#38b8e8",
    keywords: ["remote", "hybrid", "relocat", "location", "distance", "travel", "commute", "in person", "in-person"],
  },
  {
    label: "Culture / Management",
    color: "#b038e8",
    keywords: ["culture", "management", "terrible", "toxic", "leadership", "environment", "manager", "never go back", "awful", "horrible", "bad experience", "worked there"],
  },
  {
    label: "Not Interested",
    color: "#38e8a0",
    keywords: ["not interested", "no longer", "withdrew", "already accepted", "not looking", "not available", "taken a position", "took a position"],
  },
  {
    label: "Benefits",
    color: "#e838b8",
    keywords: ["benefit", "insurance", "401k", "pto", "vacation", "health", "dental", "retirement", "perks"],
  },
  {
    label: "Competing Offer",
    color: "#38e8e8",
    keywords: ["other offer", "another offer", "counter", "competing", "accepted another", "better offer"],
  },
];

// Returns the first matching theme label for a notes string, or null
export function detectTheme(notes) {
  if (!notes?.trim()) return null;
  const text = notes.toLowerCase();
  const match = THEME_DEFS.find((def) => def.keywords.some((kw) => text.includes(kw)));
  return match ?? null;
}
