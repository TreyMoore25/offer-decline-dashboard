import { useState, useEffect } from "react";
import Papa from "papaparse";
import Dashboard from "./Dashboard";
import { parseSalary } from "./salaryParser";
import { resolveCampus } from "./campuses";

const COLUMN_MAP = {
  "cn name":      "name",
  "campus":       "campus",
  "role":         "role",
  "posted comp":  "offeredSalary",
  "comp sought":  "expectedSalary",
  "issue type":   "declineReason",
  "date":         "date",
  "feedback":     "notes",
  "notes":        "notes",
};

function parseRows(rows, headers) {
  return rows.map((row, i) => {
    const record = { id: i + 1 };
    headers.forEach((h) => {
      const field = COLUMN_MAP[h.toLowerCase().trim()];
      if (!field) return;
      const raw = row[h]?.toString().trim() ?? "";
      const isNumeric = field === "offeredSalary" || field === "expectedSalary";
      let val = isNumeric ? parseSalary(raw) : raw;
      if (field === "campus") val = resolveCampus(val);
      record[field] = val;
    });
    if (!record.declineReason || !record.declineReason.trim()) record.declineReason = "Not Specified";
    if (!record.date)  record.date  = "";
    if (!record.notes) record.notes = "";
    return record;
  });
}

const LOADING = (
  <div style={{ fontFamily: "'DM Mono', monospace", background: "#0d0f14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 13, letterSpacing: 2 }}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
    LOADING DATA...
  </div>
);

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/data.csv")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        const parsed = parseRows(result.data, result.meta.fields);
        setData(parsed);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div style={{ fontFamily: "'DM Mono', monospace", background: "#0d0f14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#e85d38", fontSize: 13 }}>
        Failed to load data.csv: {error}
      </div>
    );
  }

  if (!data) return LOADING;

  return <Dashboard data={data} />;
}
