import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";

const EXPECTED_FIELDS = [
  { key: "name",          label: "Candidate Name",   required: true,  numeric: false },
  { key: "role",          label: "Role / Position",  required: true,  numeric: false },
  { key: "campus",        label: "Campus / Location",required: true,  numeric: false },
  { key: "offeredSalary", label: "Offered Salary",   required: true,  numeric: true  },
  { key: "expectedSalary",label: "Expected Salary",  required: true,  numeric: true  },
  { key: "declineReason", label: "Decline Reason",   required: false, numeric: false },
  { key: "date",          label: "Date",              required: false, numeric: false },
  { key: "notes",         label: "Notes / Feedback", required: false, numeric: false },
];

const COMMON_MAPPINGS = {
  // name
  "candidate name": "name", "candidate": "name", "applicant": "name", "full name": "name",
  "cn name": "name", "contact name": "name",
  // role
  "position": "role", "job title": "role", "title": "role",
  // campus
  "location": "campus", "office": "campus", "site": "campus",
  // offered salary
  "offered salary": "offeredSalary", "offer": "offeredSalary", "salary offered": "offeredSalary",
  "posted comp": "offeredSalary", "posted salary": "offeredSalary", "comp offered": "offeredSalary",
  // expected salary
  "expected salary": "expectedSalary", "desired salary": "expectedSalary", "ask": "expectedSalary",
  "comp sought": "expectedSalary", "salary sought": "expectedSalary", "candidate ask": "expectedSalary",
  // decline reason
  "decline reason": "declineReason", "reason": "declineReason", "reason for decline": "declineReason",
  "issue type": "declineReason", "issue": "declineReason", "decline type": "declineReason",
  // date
  "date": "date", "decline date": "date", "offer date": "date",
  // notes
  "notes": "notes", "feedback": "notes", "comments": "notes", "note": "notes",
};

function parseSalary(raw) {
  if (!raw) return 0;
  const str = raw.toString().trim();

  // K-notation: $105K, 80K, 105K (min), etc.
  const kMatch = str.match(/(\d+\.?\d*)\s*[Kk]/);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);

  // Strip currency symbols and commas
  const cleaned = str.replace(/[$,]/g, "");

  // Range: "32-38", "32 - 38", "$32-$38", "68,000-70,000"
  const rangeMatch = cleaned.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
  if (rangeMatch) {
    const low  = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    const avg  = (low + high) / 2;
    return avg < 1000 ? Math.round(avg * 2080) : Math.round(avg);
  }

  // First numeric value
  const numMatch = cleaned.match(/(\d+\.?\d*)/);
  if (!numMatch) return 0;
  const val = parseFloat(numMatch[1]);
  // Hourly if under $500
  return val < 500 ? Math.round(val * 2080) : Math.round(val);
}

function autoMap(headers) {
  const mapping = {};
  headers.forEach((h) => {
    const normalized = h.trim().toLowerCase();
    if (COMMON_MAPPINGS[normalized]) {
      mapping[h] = COMMON_MAPPINGS[normalized];
    } else {
      // try exact key match
      const match = EXPECTED_FIELDS.find((f) => f.key.toLowerCase() === normalized);
      if (match) mapping[h] = match.key;
    }
  });
  return mapping;
}

const S = {
  root: { fontFamily: "'DM Mono', monospace", background: "#0d0f14", minHeight: "100vh", color: "#e8e2d4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" },
  card: { width: "100%", maxWidth: 760, background: "#13151d", border: "1px solid #1e2130", borderRadius: 10, padding: "40px 44px" },
  label: { fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 6 },
  h1: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, margin: "0 0 6px" },
  sub: { fontSize: 12, color: "#555", marginBottom: 36 },
  dropzone: (dragging) => ({
    border: `2px dashed ${dragging ? "#e8a838" : "#2a2d36"}`,
    borderRadius: 8,
    padding: "48px 32px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    background: dragging ? "#e8a83808" : "transparent",
    marginBottom: 28,
  }),
  dropIcon: { fontSize: 32, marginBottom: 12, color: "#444" },
  dropText: { fontSize: 13, color: "#666", marginBottom: 8 },
  dropHint: { fontSize: 11, color: "#3a3d46" },
  btn: (accent) => ({
    padding: "9px 22px", fontSize: 11, fontFamily: "'DM Mono', monospace",
    background: accent ? "#e8a838" : "transparent",
    color: accent ? "#0d0f14" : "#888",
    border: accent ? "none" : "1px solid #2a2d36",
    borderRadius: 4, cursor: "pointer", letterSpacing: 1, fontWeight: accent ? 600 : 400,
    transition: "all 0.15s",
  }),
  mapGrid: { display: "grid", gridTemplateColumns: "1fr 32px 1fr", gap: "8px 12px", alignItems: "center", marginBottom: 28 },
  mapLabel: { fontSize: 11, color: "#888", padding: "8px 12px", background: "#0f111a", border: "1px solid #1e2130", borderRadius: 4 },
  arrow: { textAlign: "center", color: "#333", fontSize: 14 },
  select: { width: "100%", padding: "8px 12px", fontSize: 11, background: "#0f111a", border: "1px solid #1e2130", borderRadius: 4, color: "#e8e2d4", outline: "none", fontFamily: "'DM Mono', monospace" },
  error: { fontSize: 11, color: "#e85d38", marginBottom: 16, padding: "10px 14px", background: "#e85d3812", border: "1px solid #e85d3830", borderRadius: 4 },
  preview: { fontSize: 11, color: "#555", marginBottom: 24 },
  sectionTitle: { fontSize: 12, color: "#e8e2d4", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #1e2130" },
  required: { color: "#e85d38", marginLeft: 2 },
  mapped: { color: "#38e8a0" },
  actions: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 28, paddingTop: 24, borderTop: "1px solid #1e2130" },
};

export default function CsvUpload({ onData, onUseSample }) {
  const [dragging, setDragging] = useState(false);
  const [headers, setHeaders] = useState(null);
  const [rows, setRows] = useState(null);
  const [mapping, setMapping] = useState({});
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file) return;
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data.length) { setError("File appears to be empty."); return; }
        const hdrs = result.meta.fields;
        setHeaders(hdrs);
        setRows(result.data);
        setMapping(autoMap(hdrs));
      },
      error: (err) => setError(`Parse error: ${err.message}`),
    });
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) handleFile(file);
    else setError("Please drop a CSV file (.csv).");
  }, [handleFile]);

  const onFileInput = (e) => handleFile(e.target.files[0]);

  const setField = (header, value) => setMapping((m) => ({ ...m, [header]: value }));

  const missingRequired = EXPECTED_FIELDS.filter((f) => f.required && !Object.values(mapping).includes(f.key));


  const handleConfirm = () => {
    if (missingRequired.length) return;
    const parsed = rows.map((row, i) => {
      const record = { id: i + 1 };
      headers.forEach((h) => {
        const field = mapping[h];
        if (!field) return;
        const fieldDef = EXPECTED_FIELDS.find((f) => f.key === field);
        const raw = row[h]?.toString().trim() ?? "";
        record[field] = fieldDef?.numeric ? parseSalary(raw) : raw;
      });
      if (!record.date)         record.date = "";
      if (!record.declineReason) record.declineReason = "Not Specified";
      if (!record.notes)        record.notes = "";
      return record;
    });
    onData(parsed);
  };

  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div style={S.card}>
        <div style={S.label}>HR Analytics</div>
        <h1 style={S.h1}>Offer Decline Tracker</h1>
        <div style={S.sub}>Upload your decline data to get started, or explore with sample data.</div>

        {!headers ? (
          <>
            <div
              style={S.dropzone(dragging)}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
            >
              <div style={S.dropIcon}>📂</div>
              <div style={S.dropText}>Drop your CSV here or click to browse</div>
              <div style={S.dropHint}>Supports .csv files exported from Excel, Greenhouse, or any HR system</div>
            </div>
            <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={onFileInput} />
            {error && <div style={S.error}>{error}</div>}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button style={S.btn(false)} onClick={onUseSample}>Use sample data instead</button>
            </div>
          </>
        ) : (
          <>
            <div style={S.preview}>
              Loaded <span style={{ color: "#e8a838" }}>{rows.length} rows</span> · {headers.length} columns detected
            </div>

            <div style={S.sectionTitle}>Map your columns to dashboard fields</div>

            <div style={S.mapGrid}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#333", textTransform: "uppercase" }}>Your Column</div>
              <div />
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#333", textTransform: "uppercase" }}>Dashboard Field</div>
              {headers.map((h) => (
                <>
                  <div key={`lbl-${h}`} style={S.mapLabel}>{h}</div>
                  <div key={`arr-${h}`} style={S.arrow}>→</div>
                  <select
                    key={`sel-${h}`}
                    style={S.select}
                    value={mapping[h] || ""}
                    onChange={(e) => setField(h, e.target.value)}
                  >
                    <option value="">— skip —</option>
                    {EXPECTED_FIELDS.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.label}{f.required ? " *" : ""}
                      </option>
                    ))}
                  </select>
                </>
              ))}
            </div>

            {missingRequired.length > 0 && (
              <div style={S.error}>
                Still required: {missingRequired.map((f) => f.label).join(", ")}
              </div>
            )}

            <div style={S.actions}>
              <button style={S.btn(false)} onClick={() => { setHeaders(null); setRows(null); setError(null); }}>
                ← Back
              </button>
              <button
                style={{ ...S.btn(true), opacity: missingRequired.length ? 0.4 : 1, cursor: missingRequired.length ? "not-allowed" : "pointer" }}
                onClick={handleConfirm}
                disabled={!!missingRequired.length}
              >
                Load Dashboard →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
