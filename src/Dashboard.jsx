import { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import PlatformBreakdown from "./PlatformBreakdown";
import FeedbackIntelligence from "./FeedbackIntelligence";
import { THEME_DEFS, detectTheme } from "./feedbackThemes";
import { CAMPUS_MAP } from "./campuses";

const CAMPUS_BY_NAME = Object.fromEntries(
  Object.entries(CAMPUS_MAP).map(([code, name]) => [name, code])
);

const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// Professional, distinct campus colors
const PALETTE = [
  "#3b82f6","#8b5cf6","#06b6d4","#10b981",
  "#f59e0b","#ef4444","#ec4899","#84cc16","#f97316","#6366f1",
];

const REASON_COLORS = Object.fromEntries([
  ...THEME_DEFS.map((t) => [t.label, t.color]),
  ["Not Specified", "#94a3b8"],
]);

const PAGE_SIZE     = 25;
const GAP_PAGE_SIZE = 8;

const fmt  = (n) => "$" + Number(n).toLocaleString();
const hrly = (n) => n ? `~$${(n / 2080).toFixed(2)}/hr` : null;
const gap  = (d) => d.expectedSalary - d.offeredSalary;
const pct = (d) => d.offeredSalary
  ? (((d.expectedSalary - d.offeredSalary) / d.offeredSalary) * 100).toFixed(1)
  : "0.0";

function buildCampusColors(campuses) {
  const m = {};
  campuses.forEach((c, i) => { m[c] = PALETTE[i % PALETTE.length]; });
  return m;
}

function FilterSelect({ label, value, onChange, options, theme: T }) {
  const isActive = value !== "All";
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.textFaint, marginBottom: 6, fontFamily: FONT }}>
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "7px 32px 7px 12px",
          fontSize: 13,
          fontFamily: FONT,
          background: T.inputBg,
          color: isActive ? T.accent : T.textMuted,
          border: `1px solid ${isActive ? T.accent : T.border}`,
          borderRadius: 6,
          cursor: "pointer",
          outline: "none",
          appearance: "none",
          WebkitAppearance: "none",
          colorScheme: T.colorScheme,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='${encodeURIComponent(T.textFaint)}'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 11px center",
          minWidth: 180,
          boxShadow: T.cardShadow,
        }}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ background: T.inputBg, color: T.text }}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function MultiSelect({ label, values, onChange, options, theme: T, labelFor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onMouseDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const getLabel = labelFor || ((v) => v);
  const isActive = values.length > 0;
  const displayText = values.length === 0 ? "All" : values.length === 1 ? getLabel(values[0]) : `${values.length} selected`;

  function toggle(opt) {
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  }

  const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='${encodeURIComponent(T.textFaint)}'/%3E%3C/svg%3E")`;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.textFaint, marginBottom: 6, fontFamily: FONT }}>{label}</div>
      <button
        key={T.colorScheme}
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "7px 32px 7px 12px", fontSize: 13, fontFamily: FONT,
          background: T.inputBg, color: isActive ? T.accent : T.textMuted,
          border: `1px solid ${isActive ? T.accent : T.border}`,
          borderRadius: 6, cursor: "pointer", outline: "none", textAlign: "left",
          minWidth: 180, boxShadow: T.cardShadow, position: "relative",
          colorScheme: T.colorScheme,
          backgroundImage: chevron, backgroundRepeat: "no-repeat", backgroundPosition: "right 11px center",
        }}
      >
        {displayText}
        {isActive && (
          <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, background: T.accent, color: "#fff", borderRadius: 10, padding: "1px 6px" }}>
            {values.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200,
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
          minWidth: 220, maxHeight: 300, overflowY: "auto",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        }}>
          <div style={{ display: "flex", gap: 6, padding: "8px 10px", borderBottom: `1px solid ${T.border}` }}>
            <button onClick={() => onChange(options)} style={{ flex: 1, fontSize: 11, fontWeight: 600, fontFamily: FONT, padding: "4px 0", background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 4, cursor: "pointer" }}>Select all</button>
            <button onClick={() => onChange([])} style={{ flex: 1, fontSize: 11, fontWeight: 600, fontFamily: FONT, padding: "4px 0", background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 4, cursor: "pointer" }}>Clear</button>
          </div>
          {options.map((opt) => (
            <label key={opt} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", cursor: "pointer", borderBottom: `1px solid ${T.borderRow}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.cardAlt; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <input
                type="checkbox"
                checked={values.includes(opt)}
                onChange={() => toggle(opt)}
                style={{ accentColor: T.accent, width: 14, height: 14, cursor: "pointer", flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: T.text, fontFamily: FONT }}>{getLabel(opt)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function Card({ children, theme: T, style = {} }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 10,
      boxShadow: T.cardShadow,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, theme: T }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: T.textFaintest, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, fontFamily: FONT }}>
      {children}
    </div>
  );
}

function CardTitle({ children, theme: T }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: FONT, marginBottom: 20 }}>
      {children}
    </div>
  );
}

export default function Dashboard({ data, theme: T, isDark, onToggleTheme }) {
  const campuses  = useMemo(() => [...new Set(data.map((d) => d.campus))].sort(), [data]);
  const roles     = useMemo(() => [...new Set(data.map((d) => d.role))].sort(), [data]);
  const platforms = useMemo(() => [...new Set(data.map((d) => d.platform))].sort(), [data]);
  const campusColors = useMemo(() => buildCampusColors(campuses), [campuses]);

  const enrichedData = useMemo(() => data.map((d) => {
    let reason = d.declineReason?.trim() || "Not Specified";
    if (reason.toLowerCase() === "pay") reason = "Compensation / Pay";
    if (reason === "Not Specified") {
      const detected = detectTheme(d.notes);
      if (detected) reason = detected.label;
    }
    return { ...d, effectiveReason: reason };
  }), [data]);

  const reasons = useMemo(() =>
    [...new Set(enrichedData.map((d) => d.effectiveReason))]
      .filter((r) => r !== "Not Specified").sort(),
  [enrichedData]);

  // Applied filters — drive the actual data
  const [campusFilter,    setCampusFilter]    = useState([]);
  const [roleFilter,      setRoleFilter]      = useState([]);
  const [platformFilter,  setPlatformFilter]  = useState([]);
  const [reasonFilter,    setReasonFilter]    = useState("All");

  // Staged filters — bound to the UI controls until Apply is clicked
  const [stageCampus,    setStageCampus]    = useState([]);
  const [stageRole,      setStageRole]      = useState([]);
  const [stagePlatform,  setStagePlatform]  = useState([]);
  const [stageReason,    setStageReason]    = useState("All");

  const arrEq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  const hasPending = !arrEq(stageCampus, campusFilter) || !arrEq(stageRole, roleFilter) ||
                     !arrEq(stagePlatform, platformFilter) || stageReason !== reasonFilter;

  function applyFilters() {
    setCampusFilter(stageCampus);
    setRoleFilter(stageRole);
    setPlatformFilter(stagePlatform);
    setReasonFilter(stageReason);
  }

  function clearFilters() {
    setStageCampus([]); setCampusFilter([]);
    setStageRole([]);   setRoleFilter([]);
    setStagePlatform([]); setPlatformFilter([]);
    setStageReason("All"); setReasonFilter("All");
  }
  const [sortKey,         setSortKey]         = useState("date");
  const [sortDir,         setSortDir]         = useState("desc");
  const [expandedRecord,  setExpandedRecord]  = useState(null);
  const [page,               setPage]               = useState(0);
  const [gapPage,            setGapPage]            = useState(0);
  const [gapShowAll,         setGapShowAll]         = useState(false);
  const [campusChartPage,    setCampusChartPage]    = useState(0);
  const [campusChartShowAll, setCampusChartShowAll] = useState(false);
  const [roleChartPage,      setRoleChartPage]      = useState(0);
  const [roleChartShowAll,   setRoleChartShowAll]   = useState(false);

  const filtered = useMemo(() => enrichedData
    .filter((d) => {
      if (campusFilter.length   > 0 && !campusFilter.includes(d.campus))       return false;
      if (roleFilter.length     > 0 && !roleFilter.includes(d.role))           return false;
      if (platformFilter.length > 0 && !platformFilter.includes(d.platform))   return false;
      if (reasonFilter !== "All" && d.effectiveReason !== reasonFilter)         return false;
      return true;
    })
    .sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "gap") { av = gap(a); bv = gap(b); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    }),
  [enrichedData, campusFilter, roleFilter, platformFilter, reasonFilter, sortKey, sortDir]);

  const salaryRecords = filtered.filter((d) => d.offeredSalary > 0 && d.expectedSalary > 0);
  const avgGap  = salaryRecords.length ? Math.round(salaryRecords.reduce((s, d) => s + gap(d), 0) / salaryRecords.length) : 0;
  const compPct = filtered.length ? Math.round((filtered.filter((d) => d.effectiveReason === "Compensation / Pay").length / filtered.length) * 100) : 0;

  const overallSalaryRecs  = enrichedData.filter((d) => d.offeredSalary > 0 && d.expectedSalary > 0);
  const overallAvgOffered  = overallSalaryRecs.length ? Math.round(overallSalaryRecs.reduce((s, d) => s + d.offeredSalary,  0) / overallSalaryRecs.length) : 0;
  const overallAvgExpected = overallSalaryRecs.length ? Math.round(overallSalaryRecs.reduce((s, d) => s + d.expectedSalary, 0) / overallSalaryRecs.length) : 0;
  const campusSpotlightSalary = campusFilter.length === 1 ? salaryRecords : [];
  const campusAvgOffered   = campusSpotlightSalary.length ? Math.round(campusSpotlightSalary.reduce((s, d) => s + d.offeredSalary,  0) / campusSpotlightSalary.length) : 0;
  const campusAvgExpected  = campusSpotlightSalary.length ? Math.round(campusSpotlightSalary.reduce((s, d) => s + d.expectedSalary, 0) / campusSpotlightSalary.length) : 0;
  const SPOTLIGHT_MIN = 3;

  const campusChart = useMemo(() => {
    const byC = {};
    filtered.forEach((d) => {
      if (!byC[d.campus]) byC[d.campus] = { campus: d.campus, offered: [], expected: [] };
      byC[d.campus].offered.push(d.offeredSalary);
      byC[d.campus].expected.push(d.expectedSalary);
    });
    return Object.values(byC).map((c) => ({
      campus: c.campus,
      "Avg Offered":  Math.round(c.offered.reduce((a, b) => a + b, 0)  / c.offered.length),
      "Avg Expected": Math.round(c.expected.reduce((a, b) => a + b, 0) / c.expected.length),
    }));
  }, [filtered]);

  const roleChart = useMemo(() => {
    const byR = {};
    filtered.forEach((d) => {
      if (!byR[d.role]) byR[d.role] = { role: d.role, offered: [], expected: [] };
      byR[d.role].offered.push(d.offeredSalary);
      byR[d.role].expected.push(d.expectedSalary);
    });
    return Object.values(byR).map((r) => ({
      role: r.role,
      "Avg Offered":  Math.round(r.offered.reduce((a, b) => a + b, 0)  / r.offered.length),
      "Avg Expected": Math.round(r.expected.reduce((a, b) => a + b, 0) / r.expected.length),
    }));
  }, [filtered]);

  const reasonCounts = useMemo(() => {
    const counts = {};
    filtered.forEach((d) => { counts[d.effectiveReason] = (counts[d.effectiveReason] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const gapChart = useMemo(() => {
    const byC = {};
    filtered.forEach((d) => {
      if (!d.offeredSalary || !d.expectedSalary) return;
      if (!byC[d.campus]) byC[d.campus] = { campus: d.campus, gaps: [] };
      byC[d.campus].gaps.push(gap(d));
    });
    return Object.values(byC)
      .map((c) => ({
        campus: c.campus,
        "Avg Gap": Math.round(c.gaps.reduce((a, b) => a + b, 0) / c.gaps.length),
        count: c.gaps.length,
      }))
      .sort((a, b) => b["Avg Gap"] - a["Avg Gap"]);
  }, [filtered]);

  useEffect(() => {
    setPage(0); setGapPage(0); setCampusChartPage(0); setRoleChartPage(0);
  }, [campusFilter, roleFilter, platformFilter, reasonFilter, sortKey, sortDir]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount    = Math.ceil(filtered.length / PAGE_SIZE);
  const pageSlice    = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const gapPageCount         = Math.ceil(gapChart.length    / GAP_PAGE_SIZE);
  const gapSlice             = gapShowAll         ? gapChart    : gapChart.slice(gapPage         * GAP_PAGE_SIZE, (gapPage         + 1) * GAP_PAGE_SIZE);

  const campusChartPageCount = Math.ceil(campusChart.length / GAP_PAGE_SIZE);
  const campusChartSlice     = campusChartShowAll ? campusChart : campusChart.slice(campusChartPage * GAP_PAGE_SIZE, (campusChartPage + 1) * GAP_PAGE_SIZE);

  const roleChartPageCount   = Math.ceil(roleChart.length   / GAP_PAGE_SIZE);
  const roleChartSlice       = roleChartShowAll   ? roleChart   : roleChart.slice(roleChartPage   * GAP_PAGE_SIZE, (roleChartPage   + 1) * GAP_PAGE_SIZE);

  function exportCSV() {
    const headers = ["Candidate", "Role", "Campus", "Platform", "Offered", "Expected", "Gap", "Gap %", "Reason", "Date", "Notes"];
    const rows = filtered.map((d) => {
      const g = d.offeredSalary && d.expectedSalary ? gap(d) : "";
      const p = d.offeredSalary && d.expectedSalary ? pct(d) + "%" : "";
      return [d.name, d.role, d.campus, d.platform,
        d.offeredSalary || "", d.expectedSalary || "", g, p,
        d.effectiveReason, d.date,
        (d.notes || "").replace(/"/g, '""'),
      ].map((v) => `"${v}"`).join(",");
    });
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `offer-declines-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }) => (
    <span style={{ opacity: sortKey === k ? 1 : 0.25, marginLeft: 4, fontSize: 10 }}>
      {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const ttStyle = { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12, color: "#f1f5f9", fontFamily: FONT, padding: "8px 12px" };

  const SalaryTooltip = ({ active, payload, labelKey, labelFormatter }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    const offered  = d["Avg Offered"];
    const expected = d["Avg Expected"];
    const gapAmt   = expected - offered;
    const gapPct   = offered ? ((gapAmt / offered) * 100).toFixed(1) : "0.0";
    const label    = labelFormatter ? labelFormatter(d[labelKey]) : d[labelKey];
    return (
      <div style={{ ...ttStyle, minWidth: 200 }}>
        <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 10, borderBottom: "1px solid #334155", paddingBottom: 8 }}>{label}</div>
        <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "4px 16px" }}>
          <span style={{ color: "#64748b" }}>Avg Offered</span>
          <span style={{ textAlign: "right" }}>
            <span style={{ fontWeight: 600, color: "#60a5fa" }}>{fmt(offered)}</span>
            <span style={{ display: "block", fontSize: 10, color: "#475569" }}>{hrly(offered)}</span>
          </span>
          <span style={{ color: "#64748b" }}>Avg Expected</span>
          <span style={{ textAlign: "right" }}>
            <span style={{ fontWeight: 600, color: "#f1f5f9" }}>{fmt(expected)}</span>
            <span style={{ display: "block", fontSize: 10, color: "#475569" }}>{hrly(expected)}</span>
          </span>
          <span style={{ color: "#64748b" }}>Gap</span>
          <span style={{ fontWeight: 700, color: gapAmt > 0 ? "#fb7185" : "#4ade80", textAlign: "right" }}>
            {gapAmt >= 0 ? "+" : ""}{fmt(gapAmt)} <span style={{ fontWeight: 400, fontSize: 11 }}>({gapPct}%)</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: FONT, background: T.bg, minHeight: "100vh", color: T.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Notes modal ──────────────────────────────────────────────── */}
      {expandedRecord && (
        <div onClick={() => setExpandedRecord(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(2px)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "36px 36px 32px", maxWidth: 640, width: "100%", maxHeight: "80vh", overflowY: "auto", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <button onClick={() => setExpandedRecord(null)} style={{ position: "absolute", top: 18, right: 18, background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textFaint, width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textFaintest, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Candidate Feedback</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 6 }}>{expandedRecord.name}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              {[expandedRecord.role, expandedRecord.campus, expandedRecord.platform, expandedRecord.date].filter(Boolean).map((val, i) => (
                <span key={i} style={{ fontSize: 12, color: T.textFaint, background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 10px" }}>{val}</span>
              ))}
            </div>
            <div style={{ height: 1, background: T.border, marginBottom: 20 }} />
            <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{expandedRecord.notes}</div>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, boxShadow: T.cardShadow, padding: "16px 32px" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <img
              src="/cotulla-logo.png"
              alt="Cotulla Education logo"
              style={{ height: 40, objectFit: "contain" }}
            />
            <img
              src={isDark ? "/quad_white.png" : "/quad_black.png"}
              alt="Quad logo"
              style={{ height: 40, objectFit: "contain" }}
            />
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: T.text, letterSpacing: "-0.02em" }}>
                Sourced Candidates Not Interested Dashboard
              </h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: T.textFaintest }}>Data as of</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{today}</div>
            </div>
            <button
              onClick={onToggleTheme}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: FONT, fontWeight: 500, transition: "all 0.15s" }}
            >
              {isDark ? "☀︎ Light mode" : "☾ Dark mode"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "28px 32px" }}>

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap", alignItems: "flex-end", padding: "20px 24px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, boxShadow: T.cardShadow }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textFaintest, marginRight: 8, alignSelf: "flex-end", paddingBottom: 7 }}>Filter by</div>
          <MultiSelect label="Campus"   values={stageCampus}   onChange={setStageCampus}   options={campuses}  theme={T} labelFor={(v) => CAMPUS_BY_NAME[v] || v} />
          <MultiSelect label="Role"     values={stageRole}     onChange={setStageRole}     options={roles}     theme={T} />
          <MultiSelect label="Sourcing" values={stagePlatform} onChange={setStagePlatform} options={platforms} theme={T} />
          <FilterSelect key={T.colorScheme} label="Decline Reason" value={stageReason} onChange={setStageReason} options={["All", ...reasons]} theme={T} />
          <div style={{ alignSelf: "flex-end", display: "flex", gap: 8 }}>
            <button
              onClick={applyFilters}
              style={{ padding: "7px 18px", background: hasPending ? T.accent : T.cardAlt, border: `1px solid ${hasPending ? T.accent : T.border}`, color: hasPending ? "#fff" : T.textGhost, borderRadius: 6, cursor: hasPending ? "pointer" : "default", fontSize: 12, fontFamily: FONT, fontWeight: 600, transition: "all 0.15s" }}
            >
              Apply
            </button>
            {(campusFilter.length > 0 || roleFilter.length > 0 || platformFilter.length > 0 || reasonFilter !== "All" || stageCampus.length > 0 || stageRole.length > 0 || stagePlatform.length > 0 || stageReason !== "All") && (
              <button
                onClick={clearFilters}
                style={{ padding: "7px 14px", background: "transparent", border: `1px solid ${T.accentRed}`, color: T.accentRed, borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: FONT, fontWeight: 500 }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Declinations", value: filtered.length,  sub: "in current view",      accent: T.accent     },
            { label: "Avg. Salary Gap",    value: fmt(avgGap),       sub: "offered vs. expected", accent: T.accentRed  },
            { label: "Compensation-Driven",value: `${compPct}%`,    sub: "of all declines",       accent: T.accentBlue },
          ].map((k) => (
            <Card key={k.label} theme={T} style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.textFaint }}>{k.label}</div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: k.accent, marginTop: 4 }} />
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: T.text, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 6 }}>{k.value}</div>
              <div style={{ fontSize: 12, color: T.textFaintest }}>{k.sub}</div>
              <div style={{ marginTop: 16, height: 3, background: T.border, borderRadius: 2 }}>
                <div style={{ height: "100%", width: "100%", background: `linear-gradient(to right, ${k.accent}44, ${k.accent})`, borderRadius: 2 }} />
              </div>
            </Card>
          ))}

          {/* Decline Reasons donut — compact KPI card */}
          <Card theme={T} style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textFaint, marginBottom: 6 }}>Decline Reasons</div>
            <div style={{ position: "relative" }}>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={reasonCounts} dataKey="value" cx="50%" cy="50%" innerRadius={34} outerRadius={54} paddingAngle={3} strokeWidth={0}>
                    {reasonCounts.map((r) => (
                      <Cell key={r.name} fill={REASON_COLORS[r.name] || T.textMuted} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const { name, value } = payload[0];
                      const share = Math.round((value / filtered.length) * 100);
                      const color = REASON_COLORS[name] || "#94a3b8";
                      return (
                        <div style={{ ...ttStyle, minWidth: 160 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                            <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 12 }}>{name}</span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "2px 12px" }}>
                            <span style={{ color: "#64748b", fontSize: 11 }}>Count</span>
                            <span style={{ fontWeight: 600, color, textAlign: "right", fontSize: 11 }}>{value}</span>
                            <span style={{ color: "#64748b", fontSize: 11 }}>Share</span>
                            <span style={{ fontWeight: 600, color: "#f1f5f9", textAlign: "right", fontSize: 11 }}>{share}%</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: T.text, lineHeight: 1, letterSpacing: "-0.02em" }}>{filtered.length}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: T.textFaintest, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Total</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
              {reasonCounts.slice(0, 3).map((r) => (
                <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: REASON_COLORS[r.name] || T.textMuted, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{r.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.text, flexShrink: 0 }}>{r.value}</span>
                </div>
              ))}
              {reasonCounts.length > 3 && (
                <div style={{ fontSize: 10, color: T.textFaintest, textAlign: "right" }}>+{reasonCounts.length - 3} more</div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Campus Spotlight ─────────────────────────────────────────── */}
        {campusFilter.length === 1 && (() => {
          const code     = CAMPUS_BY_NAME[campusFilter[0]] || campusFilter[0];
          const name     = campusFilter[0];
          const hasData  = campusSpotlightSalary.length >= SPOTLIGHT_MIN;
          const campusGap = campusAvgOffered && campusAvgExpected ? campusAvgExpected - campusAvgOffered : null;
          const overallGap = overallAvgOffered && overallAvgExpected ? overallAvgExpected - overallAvgOffered : null;
          return (
            <Card theme={T} style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <SectionLabel theme={T}>Campus Spotlight</SectionLabel>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: FONT }}>
                    {code} · {name}
                    <span style={{ fontSize: 12, fontWeight: 400, color: T.textFaintest, marginLeft: 12 }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
              {!hasData ? (
                <div style={{ fontSize: 14, color: T.textFaintest, fontStyle: "italic", textAlign: "center", padding: "24px 0" }}>
                  More data coming soon
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {[
                    { label: "Avg Offered Salary",  campusVal: campusAvgOffered,  overallVal: overallAvgOffered,  accent: T.accent,      higherIsBetter: true  },
                    { label: "Avg Expected Salary",  campusVal: campusAvgExpected, overallVal: overallAvgExpected, accent: T.accentRed,   higherIsBetter: false },
                    { label: "Avg Salary Gap",       campusVal: campusGap,         overallVal: overallGap,         accent: "#f59e0b",     higherIsBetter: false },
                  ].map(({ label, campusVal, overallVal, accent, higherIsBetter }) => {
                    const delta = campusVal != null && overallVal != null ? campusVal - overallVal : null;
                    const deltaPositive = delta != null && delta > 0;
                    const deltaColor = delta == null ? T.textFaintest
                      : higherIsBetter ? (deltaPositive ? T.accentGreen : T.accentRed)
                      : (deltaPositive ? T.accentRed : T.accentGreen);
                    return (
                      <div key={label} style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "14px 16px" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: T.textFaint, marginBottom: 10 }}>{label}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 10, color: T.textFaintest, marginBottom: 3 }}>This Campus</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: accent, letterSpacing: "-0.02em", lineHeight: 1 }}>
                              {campusVal != null ? fmt(campusVal) : "—"}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 10, color: T.textFaintest, marginBottom: 3 }}>Overall Avg</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: T.textMuted }}>
                              {overallVal != null ? fmt(overallVal) : "—"}
                            </div>
                          </div>
                        </div>
                        {delta != null && (
                          <div style={{ fontSize: 12, color: deltaColor, fontWeight: 600 }}>
                            {delta >= 0 ? "+" : ""}{fmt(delta)} vs. overall
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })()}

        {/* ── Charts row 1 ─────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <Card theme={T} style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div><SectionLabel theme={T}>By Campus</SectionLabel><CardTitle theme={T}>Offered vs. Expected Salary</CardTitle></div>
              <button onClick={() => { setCampusChartShowAll((v) => !v); setCampusChartPage(0); }} style={{ fontSize: 11, fontWeight: 500, fontFamily: FONT, padding: "4px 10px", background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textFaint, borderRadius: 5, cursor: "pointer", marginTop: 2, whiteSpace: "nowrap" }}>
                {campusChartShowAll ? "Show less" : "Show all"}
              </button>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(160, campusChartSlice.length * 42)}>
              <BarChart data={campusChartSlice} layout="vertical" barGap={3} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={T.chartGrid} horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: T.textFaintest, fontSize: 11, fontFamily: FONT }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="campus" tickFormatter={(v) => CAMPUS_BY_NAME[v] || v} tick={{ fill: T.textFaint, fontSize: 12, fontFamily: FONT, fontWeight: 600 }} axisLine={false} tickLine={false} width={52} />
                <Tooltip cursor={{ fill: T.border, opacity: 0.35 }} content={(props) => <SalaryTooltip {...props} labelKey="campus" labelFormatter={(v) => `${CAMPUS_BY_NAME[v] || v} — ${v}`} />} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: FONT, color: T.textFaint }} />
                <Bar dataKey="Avg Offered"  fill={T.accent}    radius={[0, 4, 4, 0]} />
                <Bar dataKey="Avg Expected" fill={T.accentRed} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {!campusChartShowAll && campusChartPageCount > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <span style={{ fontSize: 11, color: T.textFaintest }}>
                  {campusChartPage * GAP_PAGE_SIZE + 1}–{Math.min((campusChartPage + 1) * GAP_PAGE_SIZE, campusChart.length)} of {campusChart.length} campuses
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => setCampusChartPage((p) => p - 1)} disabled={campusChartPage === 0} style={{ padding: "3px 10px", fontSize: 12, fontFamily: FONT, background: T.cardAlt, border: `1px solid ${T.border}`, color: campusChartPage === 0 ? T.textGhost : T.textMuted, borderRadius: 5, cursor: campusChartPage === 0 ? "default" : "pointer" }}>← Prev</button>
                  <button onClick={() => setCampusChartPage((p) => p + 1)} disabled={campusChartPage === campusChartPageCount - 1} style={{ padding: "3px 10px", fontSize: 12, fontFamily: FONT, background: T.cardAlt, border: `1px solid ${T.border}`, color: campusChartPage === campusChartPageCount - 1 ? T.textGhost : T.textMuted, borderRadius: 5, cursor: campusChartPage === campusChartPageCount - 1 ? "default" : "pointer" }}>Next →</button>
                </div>
              </div>
            )}
          </Card>

          <Card theme={T} style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div><SectionLabel theme={T}>By Role</SectionLabel><CardTitle theme={T}>Offered vs. Expected Salary</CardTitle></div>
              <button onClick={() => { setRoleChartShowAll((v) => !v); setRoleChartPage(0); }} style={{ fontSize: 11, fontWeight: 500, fontFamily: FONT, padding: "4px 10px", background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textFaint, borderRadius: 5, cursor: "pointer", marginTop: 2, whiteSpace: "nowrap" }}>
                {roleChartShowAll ? "Show less" : "Show all"}
              </button>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(160, roleChartSlice.length * 42)}>
              <BarChart data={roleChartSlice} layout="vertical" barGap={3} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={T.chartGrid} horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: T.textFaintest, fontSize: 11, fontFamily: FONT }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="role" tickFormatter={(v) => v.length > 24 ? v.slice(0, 22) + "…" : v} tick={{ fill: T.textFaint, fontSize: 11, fontFamily: FONT }} axisLine={false} tickLine={false} width={150} />
                <Tooltip cursor={{ fill: T.border, opacity: 0.35 }} content={(props) => <SalaryTooltip {...props} labelKey="role" />} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: FONT, color: T.textFaint }} />
                <Bar dataKey="Avg Offered"  fill={T.accentBlue}   radius={[0, 4, 4, 0]} />
                <Bar dataKey="Avg Expected" fill={T.accentPurple} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {!roleChartShowAll && roleChartPageCount > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <span style={{ fontSize: 11, color: T.textFaintest }}>
                  {roleChartPage * GAP_PAGE_SIZE + 1}–{Math.min((roleChartPage + 1) * GAP_PAGE_SIZE, roleChart.length)} of {roleChart.length} roles
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => setRoleChartPage((p) => p - 1)} disabled={roleChartPage === 0} style={{ padding: "3px 10px", fontSize: 12, fontFamily: FONT, background: T.cardAlt, border: `1px solid ${T.border}`, color: roleChartPage === 0 ? T.textGhost : T.textMuted, borderRadius: 5, cursor: roleChartPage === 0 ? "default" : "pointer" }}>← Prev</button>
                  <button onClick={() => setRoleChartPage((p) => p + 1)} disabled={roleChartPage === roleChartPageCount - 1} style={{ padding: "3px 10px", fontSize: 12, fontFamily: FONT, background: T.cardAlt, border: `1px solid ${T.border}`, color: roleChartPage === roleChartPageCount - 1 ? T.textGhost : T.textMuted, borderRadius: 5, cursor: roleChartPage === roleChartPageCount - 1 ? "default" : "pointer" }}>Next →</button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ── Charts row 2 ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          {/* Gap by Campus — full width */}
          <Card theme={T} style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <SectionLabel theme={T}>Salary Gap Analysis</SectionLabel>
                <CardTitle theme={T}>Average Gap by Campus</CardTitle>
              </div>
              <button
                onClick={() => { setGapShowAll((v) => !v); setGapPage(0); }}
                style={{ fontSize: 11, fontWeight: 500, fontFamily: FONT, padding: "4px 10px", background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textFaint, borderRadius: 5, cursor: "pointer", marginTop: 2, whiteSpace: "nowrap" }}
              >
                {gapShowAll ? "Show less" : "Show all"}
              </button>
            </div>
            <div style={{ fontSize: 12, color: T.textFaint, marginBottom: 16 }}>
              Average difference between expected and offered salary — sorted by largest gap
            </div>
            <ResponsiveContainer width="100%" height={Math.max(160, gapSlice.length * 42)}>
              <BarChart data={gapSlice} layout="vertical" barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={T.chartGrid} horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fill: T.textFaintest, fontSize: 11, fontFamily: FONT }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="campus"
                  tickFormatter={(v) => CAMPUS_BY_NAME[v] || v}
                  tick={{ fill: T.textFaint, fontSize: 12, fontFamily: FONT, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  cursor={{ fill: T.border, opacity: 0.35 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    const code = CAMPUS_BY_NAME[d.campus] || d.campus;
                    const barColor =
                      d["Avg Gap"] > 15000 ? T.accentRed :
                      d["Avg Gap"] > 8000  ? "#f59e0b"   :
                      d["Avg Gap"] > 3000  ? T.accent    :
                      T.accentGreen;
                    return (
                      <div style={{ ...ttStyle, minWidth: 180 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{code}</span>
                          <span style={{ fontSize: 11, color: "#64748b" }}>{d.campus}</span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: barColor, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 4 }}>
                          {fmt(d["Avg Gap"])}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>avg gap · {d.count} candidate{d.count !== 1 ? "s" : ""}</div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="Avg Gap" radius={[0, 4, 4, 0]}>
                  {gapSlice.map((entry) => (
                    <Cell
                      key={entry.campus}
                      fill={
                        entry["Avg Gap"] > 15000 ? T.accentRed  :
                        entry["Avg Gap"] > 8000  ? "#f59e0b"    :
                        entry["Avg Gap"] > 3000  ? T.accent     :
                        T.accentGreen
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Gap chart pagination */}
            {!gapShowAll && gapPageCount > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                <span style={{ fontSize: 11, color: T.textFaintest }}>
                  {gapPage * GAP_PAGE_SIZE + 1}–{Math.min((gapPage + 1) * GAP_PAGE_SIZE, gapChart.length)} of {gapChart.length} campuses
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => setGapPage((p) => p - 1)}
                    disabled={gapPage === 0}
                    style={{ padding: "3px 10px", fontSize: 12, fontFamily: FONT, background: T.cardAlt, border: `1px solid ${T.border}`, color: gapPage === 0 ? T.textGhost : T.textMuted, borderRadius: 5, cursor: gapPage === 0 ? "default" : "pointer" }}
                  >← Prev</button>
                  <button
                    onClick={() => setGapPage((p) => p + 1)}
                    disabled={gapPage === gapPageCount - 1}
                    style={{ padding: "3px 10px", fontSize: 12, fontFamily: FONT, background: T.cardAlt, border: `1px solid ${T.border}`, color: gapPage === gapPageCount - 1 ? T.textGhost : T.textMuted, borderRadius: 5, cursor: gapPage === gapPageCount - 1 ? "default" : "pointer" }}
                  >Next →</button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              {[
                { color: T.accentRed,   label: "High  > $15k"   },
                { color: "#f59e0b",     label: "Mid   $8–15k"   },
                { color: T.accent,      label: "Low   $3–8k"    },
                { color: T.accentGreen, label: "Min   < $3k"    },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.textFaint }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  {label}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Platform Breakdown ───────────────────────────────────────── */}
        <PlatformBreakdown records={filtered} theme={T} />

        {/* ── Feedback Intelligence ────────────────────────────────────── */}
        <FeedbackIntelligence records={filtered} theme={T} />

        {/* ── Records Table ────────────────────────────────────────────── */}
        <Card theme={T} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Declined Offer Records</div>
              <div style={{ fontSize: 12, color: T.textFaintest, marginTop: 2 }}>Click any row with feedback to read full notes</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.textFaintest }}>{filtered.length} records</span>
              <button
                onClick={exportCSV}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: FONT, fontWeight: 500 }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M6.5 1v7M3.5 5l3 3 3-3M1 9v2a1 1 0 001 1h9a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export CSV
              </button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: T.cardAlt }}>
                  {[
                    { label: "Candidate",key: "name"           },
                    { label: "Role",     key: "role"           },
                    { label: "Campus",   key: "campus"         },
                    { label: "Platform", key: "platform"       },
                    { label: "Offered",  key: "offeredSalary"  },
                    { label: "Expected", key: "expectedSalary" },
                    { label: "Gap",      key: "gap"            },
                    { label: "Reason",   key: "declineReason"  },
                    { label: "Date",     key: "date"           },
                    { label: "Notes",    key: "notes"          },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", color: sortKey === col.key ? T.accent : T.textFaintest, textTransform: "uppercase", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", borderBottom: `1px solid ${T.border}` }}
                    >
                      {col.label}<SortIcon k={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageSlice.map((d, i) => {
                  const g = gap(d);
                  const campusColor  = campusColors[d.campus] || T.textMuted;
                  const displayReason = d.effectiveReason;
                  const reasonColor   = REASON_COLORS[displayReason] || T.textMuted;
                  const isInferred    = d.declineReason === "Not Specified" && displayReason !== "Not Specified";
                  const hasNotes      = !!d.notes?.trim();
                  return (
                    <tr
                      key={d.id ?? i}
                      onClick={() => hasNotes && setExpandedRecord(d)}
                      style={{ borderBottom: `1px solid ${T.borderRow}`, background: i % 2 === 0 ? "transparent" : T.cardAlt, cursor: hasNotes ? "pointer" : "default", transition: "background 0.1s" }}
                      onMouseEnter={(e) => { if (hasNotes) e.currentTarget.style.background = T.border; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? "transparent" : T.cardAlt; }}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: 500, color: T.text }}>{d.name}</td>
                      <td style={{ padding: "12px 16px", color: T.textMuted }}>{d.role}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ color: campusColor, background: campusColor + "18", padding: "3px 9px", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{d.campus}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: T.textFaint }}>{d.platform}</td>
                      <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>
                        {d.offeredSalary ? <><span style={{ color: T.accent, fontWeight: 600 }}>{fmt(d.offeredSalary)}</span><br /><span style={{ fontSize: 11, color: T.textFaintest }}>{hrly(d.offeredSalary)}</span></> : "—"}
                      </td>
                      <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>
                        {d.expectedSalary ? <><span style={{ color: T.text, fontWeight: 500 }}>{fmt(d.expectedSalary)}</span><br /><span style={{ fontSize: 11, color: T.textFaintest }}>{hrly(d.expectedSalary)}</span></> : "—"}
                      </td>
                      <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>
                        {d.offeredSalary && d.expectedSalary ? (
                          <span style={{ color: g > 0 ? T.accentRed : T.accentGreen, fontWeight: 600 }}>
                            {g >= 0 ? "+" : ""}{fmt(g)}{" "}
                            <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.75 }}>({pct(d)}%)</span>
                          </span>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ color: reasonColor, background: reasonColor + "18", padding: "3px 9px", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
                          {displayReason}
                        </span>
                        {isInferred && <span title="Inferred from feedback" style={{ marginLeft: 5, fontSize: 9, color: T.textGhost }}>✦</span>}
                      </td>
                      <td style={{ padding: "12px 16px", color: T.textFaint, fontSize: 12 }}>{d.date}</td>
                      <td style={{ padding: "12px 16px", color: T.textFaint, fontSize: 12, maxWidth: 260 }}>
                        {hasNotes && (
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{d.notes}</span>
                            <span style={{ color: T.accent, flexShrink: 0, fontSize: 11 }}>↗</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: T.textGhost, fontSize: 14 }}>No records match the current filters.</div>
            )}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderTop: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 12, color: T.textFaintest }}>
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} records
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[
                  { label: "«", action: () => setPage(0),           disabled: page === 0              },
                  { label: "‹", action: () => setPage((p) => p - 1), disabled: page === 0             },
                ].map(({ label, action, disabled }) => (
                  <button key={label} onClick={action} disabled={disabled} style={{ minWidth: 32, height: 32, padding: "0 8px", background: T.cardAlt, border: `1px solid ${T.border}`, color: disabled ? T.textGhost : T.textMuted, borderRadius: 6, cursor: disabled ? "default" : "pointer", fontSize: 13, fontFamily: FONT }}>
                    {label}
                  </button>
                ))}
                {Array.from({ length: pageCount }, (_, i) => i)
                  .filter((i) => i === 0 || i === pageCount - 1 || Math.abs(i - page) <= 2)
                  .reduce((acc, i, idx, arr) => {
                    if (idx > 0 && i - arr[idx - 1] > 1) acc.push("…");
                    acc.push(i);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "…" ? (
                      <span key={`ellipsis-${idx}`} style={{ minWidth: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: T.textGhost, fontSize: 13 }}>…</span>
                    ) : (
                      <button key={item} onClick={() => setPage(item)} style={{ minWidth: 32, height: 32, padding: "0 8px", background: item === page ? T.accent : T.cardAlt, border: `1px solid ${item === page ? T.accent : T.border}`, color: item === page ? "#fff" : T.textMuted, borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: FONT, fontWeight: item === page ? 600 : 400 }}>
                        {item + 1}
                      </button>
                    )
                  )}
                {[
                  { label: "›", action: () => setPage((p) => p + 1), disabled: page === pageCount - 1 },
                  { label: "»", action: () => setPage(pageCount - 1), disabled: page === pageCount - 1 },
                ].map(({ label, action, disabled }) => (
                  <button key={label} onClick={action} disabled={disabled} style={{ minWidth: 32, height: 32, padding: "0 8px", background: T.cardAlt, border: `1px solid ${T.border}`, color: disabled ? T.textGhost : T.textMuted, borderRadius: 6, cursor: disabled ? "default" : "pointer", fontSize: 13, fontFamily: FONT }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
