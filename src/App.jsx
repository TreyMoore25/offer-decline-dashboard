import { useState, useEffect } from "react";
import Papa from "papaparse";
import Dashboard from "./Dashboard";
import { parseSalary } from "./salaryParser";
import { resolveCampus } from "./campuses";
import { DARK, LIGHT } from "./themes";

const COLUMN_MAP = {
  "cn name":      "name",
  "campus":       "campus",
  "role":         "role",
  "platform":     "platform",
  "posted comp":  "offeredSalary",
  "comp sought":  "expectedSalary",
  "issue type":   "declineReason",
  "date":         "date",
  "feedback":     "feedback",
  "notes":        "notes",
};

function normalizePlatform(raw) {
  if (!raw) return "Other";
  const v = raw.trim();
  const lower = v.toLowerCase();
  if (lower === "li" || lower === "linkedin") return "LinkedIn";
  if (lower === "indeed")                     return "Indeed";
  if (lower === "email")                      return "Email";
  if (lower.includes("alum"))   return "Alumni";
  if (lower.includes("referr")) return "Referral";
  return "Other";
}

function normalizeRole(raw) {
  if (!raw) return raw;
  const lower = raw.toLowerCase().trim();
  if (/^amt\s+ins(t(ructor)?)?\.?$/i.test(raw.trim())) return "AMT Instructor";
  return raw.trim();
}

function parseRows(rows, headers) {
  return rows.map((row, i) => {
    const record = { id: i + 1 };
    headers.forEach((h) => {
      const field = COLUMN_MAP[h.toLowerCase().trim()];
      if (!field) return;
      const raw = row[h]?.toString().trim() ?? "";
      const isNumeric = field === "offeredSalary" || field === "expectedSalary";
      record[field] = isNumeric ? parseSalary(raw) : raw;
    });
    // Resolve campus code → full name
    if (record.campus) record.campus = resolveCampus(record.campus);
    // Normalize platform
    record.platform = normalizePlatform(record.platform);
    // Normalize role
    if (record.role) record.role = normalizeRole(record.role);
    // Combine feedback + recruiter notes into one field
    const parts = [record.feedback, record.notes].filter(Boolean);
    record.notes = parts.join(" | ").trim();
    delete record.feedback;
    // Parse date → year-month string for time series grouping
    if (record.date) {
      const d = new Date(record.date);
      record.yearMonth = !isNaN(d)
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        : null;
    } else {
      record.yearMonth = null;
    }
    // Swap offered/expected if entered backwards (data entry error)
    if (record.offeredSalary > 0 && record.expectedSalary > 0 && record.offeredSalary > record.expectedSalary) {
      [record.offeredSalary, record.expectedSalary] = [record.expectedSalary, record.offeredSalary];
    }
    // Fallbacks
    if (!record.declineReason?.trim()) record.declineReason = "Not Specified";
    if (!record.date)  record.date  = "";
    return record;
  }).filter((r) => r.role?.trim() && r.name?.trim() && r.campus?.trim());
}

const Spinner = ({ theme }) => (
  <div style={{ fontFamily: "'DM Mono', monospace", background: theme.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: theme.textFaintest, fontSize: 13, letterSpacing: 2 }}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
    LOADING DATA...
  </div>
);

export default function App() {
  const [data,   setData]   = useState(null);
  const [error,  setError]  = useState(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  const theme = isDark ? DARK : LIGHT;

  const toggleTheme = () => {
    setIsDark((d) => {
      localStorage.setItem("theme", d ? "light" : "dark");
      return !d;
    });
  };

  useEffect(() => {
    fetch("/data.csv")
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.text(); })
      .then((text) => {
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        setData(parseRows(result.data, result.meta.fields));
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return (
    <div style={{ fontFamily: "'DM Mono', monospace", background: theme.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: theme.accentRed, fontSize: 13 }}>
      Failed to load data.csv: {error}
    </div>
  );

  if (!data) return <Spinner theme={theme} />;

  return <Dashboard data={data} theme={theme} isDark={isDark} onToggleTheme={toggleTheme} />;
}
