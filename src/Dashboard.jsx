import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, ResponsiveContainer,
} from "recharts";

const PALETTE = ["#e8a838", "#e85d38", "#38b8e8", "#38e8a0", "#b038e8", "#e838b8", "#38e8e8", "#e8e838"];

const REASON_COLORS = {
  Compensation: "#e85d38",
  Benefits: "#e8a838",
  Location: "#38b8e8",
  "Other Offer": "#b038e8",
};

const fmt = (n) => "$" + Number(n).toLocaleString();
const gap = (d) => d.expectedSalary - d.offeredSalary;
const pct = (d) => d.offeredSalary
  ? (((d.expectedSalary - d.offeredSalary) / d.offeredSalary) * 100).toFixed(1)
  : "0.0";

function buildCampusColors(campuses) {
  const colors = {};
  campuses.forEach((c, i) => { colors[c] = PALETTE[i % PALETTE.length]; });
  return colors;
}

export default function Dashboard({ data, onReset }) {
  const campuses = useMemo(() => [...new Set(data.map((d) => d.campus))].sort(), [data]);
  const roles    = useMemo(() => [...new Set(data.map((d) => d.role))].sort(), [data]);
  const reasons  = useMemo(() => [...new Set(data.map((d) => d.declineReason))].sort(), [data]);

  const campusColors = useMemo(() => buildCampusColors(campuses), [campuses]);

  const [campusFilter, setCampusFilter] = useState("All");
  const [roleFilter,   setRoleFilter]   = useState("All");
  const [reasonFilter, setReasonFilter] = useState("All");
  const [sortKey,      setSortKey]      = useState("date");
  const [sortDir,      setSortDir]      = useState("desc");

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (campusFilter !== "All" && d.campus !== campusFilter) return false;
      if (roleFilter   !== "All" && d.role   !== roleFilter)   return false;
      if (reasonFilter !== "All" && d.declineReason !== reasonFilter) return false;
      return true;
    }).sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "gap") { av = gap(a); bv = gap(b); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, campusFilter, roleFilter, reasonFilter, sortKey, sortDir]);

  const avgGap = filtered.length
    ? Math.round(filtered.reduce((s, d) => s + gap(d), 0) / filtered.length) : 0;
  const compPct = filtered.length
    ? Math.round((filtered.filter((d) => d.declineReason === "Compensation").length / filtered.length) * 100) : 0;

  const campusChart = useMemo(() => {
    const byC = {};
    filtered.forEach((d) => {
      if (!byC[d.campus]) byC[d.campus] = { campus: d.campus, offered: [], expected: [] };
      byC[d.campus].offered.push(d.offeredSalary);
      byC[d.campus].expected.push(d.expectedSalary);
    });
    return Object.values(byC).map((c) => ({
      campus: c.campus,
      "Avg Offered": Math.round(c.offered.reduce((a, b) => a + b, 0) / c.offered.length),
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
      "Avg Offered": Math.round(r.offered.reduce((a, b) => a + b, 0) / r.offered.length),
      "Avg Expected": Math.round(r.expected.reduce((a, b) => a + b, 0) / r.expected.length),
    }));
  }, [filtered]);

  const reasonCounts = useMemo(() => {
    const counts = {};
    filtered.forEach((d) => { counts[d.declineReason] = (counts[d.declineReason] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }) => (
    <span style={{ opacity: sortKey === k ? 1 : 0.3, marginLeft: 4, fontSize: 10 }}>
      {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ fontFamily: "'DM Mono', monospace", background: "#0d0f14", minHeight: "100vh", color: "#e8e2d4", padding: "32px 28px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, borderBottom: "1px solid #2a2d36", paddingBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#e8a838", marginBottom: 6, textTransform: "uppercase" }}>HR Analytics</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1 }}>Offer Decline Tracker</h1>
          <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Salary gap analysis · Campus comparison · Decline reasons</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <div style={{ fontSize: 11, color: "#555", textAlign: "right" }}>
            <div>Last updated</div>
            <div style={{ color: "#e8a838" }}>{today}</div>
          </div>
          <button
            onClick={onReset}
            style={{ fontSize: 10, letterSpacing: 1, padding: "5px 12px", background: "transparent", border: "1px solid #2a2d36", color: "#555", borderRadius: 3, cursor: "pointer", textTransform: "uppercase" }}
          >
            ↑ Load new file
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { label: "Campus", value: campusFilter, set: setCampusFilter, opts: ["All", ...campuses] },
          { label: "Role",   value: roleFilter,   set: setRoleFilter,   opts: ["All", ...roles]    },
          { label: "Reason", value: reasonFilter, set: setReasonFilter, opts: ["All", ...reasons]  },
        ].map((f) => (
          <div key={f.label}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#555", marginBottom: 6, textTransform: "uppercase" }}>{f.label}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {f.opts.map((o) => (
                <button key={o} onClick={() => f.set(o)} style={{
                  padding: "5px 12px", fontSize: 11,
                  border: f.value === o ? "1px solid #e8a838" : "1px solid #2a2d36",
                  background: f.value === o ? "#e8a83820" : "transparent",
                  color: f.value === o ? "#e8a838" : "#888",
                  borderRadius: 3, cursor: "pointer", letterSpacing: 0.5, transition: "all 0.15s",
                }}>{o}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Declinations",  value: filtered.length,                                        sub: "in filtered view",    accent: "#e8a838" },
          { label: "Avg Salary Gap",       value: fmt(avgGap),                                            sub: "offered vs expected", accent: "#e85d38" },
          { label: "Compensation-Driven",  value: `${compPct}%`,                                          sub: "of all declines",     accent: "#38b8e8" },
          { label: "Campuses Affected",    value: [...new Set(filtered.map((d) => d.campus))].length,     sub: "unique locations",    accent: "#38e8a0" },
        ].map((k) => (
          <div key={k.label} style={{ background: "#13151d", border: "1px solid #1e2130", borderRadius: 8, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: k.accent }} />
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#555", textTransform: "uppercase", marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontSize: 30, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: k.accent, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#444", marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "#13151d", border: "1px solid #1e2130", borderRadius: 8, padding: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 4 }}>By Campus</div>
          <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>Offered vs. Expected Salary</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={campusChart} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2130" />
              <XAxis dataKey="campus" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "#13151d", border: "1px solid #2a2d36", borderRadius: 6, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#666" }} />
              <Bar dataKey="Avg Offered"  fill="#e8a838" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Avg Expected" fill="#e85d38" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#13151d", border: "1px solid #1e2130", borderRadius: 8, padding: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 4 }}>By Role</div>
          <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>Offered vs. Expected Salary</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roleChart} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2130" />
              <XAxis dataKey="role" tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "#13151d", border: "1px solid #2a2d36", borderRadius: 6, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#666" }} />
              <Bar dataKey="Avg Offered"  fill="#38b8e8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Avg Expected" fill="#b038e8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginBottom: 20 }}>
        {/* Decline reasons */}
        <div style={{ background: "#13151d", border: "1px solid #1e2130", borderRadius: 8, padding: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 4 }}>Breakdown</div>
          <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>Decline Reasons</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reasonCounts.map((r) => (
              <div key={r.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                  <span style={{ color: REASON_COLORS[r.name] || "#888" }}>{r.name}</span>
                  <span style={{ color: "#555" }}>{r.value} · {Math.round((r.value / filtered.length) * 100)}%</span>
                </div>
                <div style={{ height: 4, background: "#1e2130", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(r.value / filtered.length) * 100}%`, background: REASON_COLORS[r.name] || "#888", borderRadius: 2, transition: "width 0.4s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scatter */}
        <div style={{ background: "#13151d", border: "1px solid #1e2130", borderRadius: 8, padding: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 4 }}>Salary Gap Analysis</div>
          <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 4 }}>Offered vs. Expected · Each Candidate</div>
          <div style={{ fontSize: 11, color: "#444", marginBottom: 16 }}>Points above the diagonal line = expectation gap</div>
          <ResponsiveContainer width="100%" height={210}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2130" />
              <XAxis dataKey="offeredSalary"  name="Offered"  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Offered",  position: "insideBottom", offset: -2, fill: "#444", fontSize: 10 }} />
              <YAxis dataKey="expectedSalary" name="Expected" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Expected", angle: -90,  position: "insideLeft",  fill: "#444", fontSize: 10 }} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  const g = gap(d);
                  return (
                    <div style={{ background: "#13151d", border: "1px solid #2a2d36", borderRadius: 6, padding: "10px 14px", fontSize: 11 }}>
                      <div style={{ color: campusColors[d.campus] || "#888", marginBottom: 4 }}>{d.name} · {d.campus}</div>
                      <div style={{ color: "#888" }}>{d.role}</div>
                      <div style={{ marginTop: 6 }}>Offered: <span style={{ color: "#e8a838" }}>{fmt(d.offeredSalary)}</span></div>
                      <div>Expected: <span style={{ color: "#e85d38" }}>{fmt(d.expectedSalary)}</span></div>
                      <div>Gap: <span style={{ color: g > 0 ? "#e85d38" : "#38e8a0" }}>+{fmt(g)} ({pct(d)}%)</span></div>
                    </div>
                  );
                }}
              />
              <Scatter
                data={filtered}
                shape={(props) => {
                  const { cx, cy, payload } = props;
                  return <circle cx={cx} cy={cy} r={7} fill={campusColors[payload.campus] || "#888"} fillOpacity={0.85} stroke="none" />;
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
            {campuses.map((c) => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#666" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: campusColors[c] }} />
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#13151d", border: "1px solid #1e2130", borderRadius: 8, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 4 }}>Records</div>
            <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>All Declined Offers</div>
          </div>
          <div style={{ fontSize: 11, color: "#555" }}>{filtered.length} records</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e2130" }}>
                {[
                  { label: "Name",     key: "name"           },
                  { label: "Role",     key: "role"           },
                  { label: "Campus",   key: "campus"         },
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
                    style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, letterSpacing: 2, color: sortKey === col.key ? "#e8a838" : "#444", textTransform: "uppercase", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                  >
                    {col.label}<SortIcon k={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const g = gap(d);
                const campusColor = campusColors[d.campus] || "#888";
                const reasonColor = REASON_COLORS[d.declineReason] || "#888";
                return (
                  <tr key={d.id ?? i} style={{ borderBottom: "1px solid #1a1d26", background: i % 2 === 0 ? "transparent" : "#0f111a" }}>
                    <td style={{ padding: "11px 14px", color: "#c8c2b4" }}>{d.name}</td>
                    <td style={{ padding: "11px 14px", color: "#888" }}>{d.role}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ color: campusColor, background: `${campusColor}18`, padding: "2px 8px", borderRadius: 3, fontSize: 11 }}>{d.campus}</span>
                    </td>
                    <td style={{ padding: "11px 14px", color: "#e8a838", fontVariantNumeric: "tabular-nums" }}>{fmt(d.offeredSalary)}</td>
                    <td style={{ padding: "11px 14px", color: "#e8e2d4",  fontVariantNumeric: "tabular-nums" }}>{fmt(d.expectedSalary)}</td>
                    <td style={{ padding: "11px 14px", fontVariantNumeric: "tabular-nums" }}>
                      <span style={{ color: g > 0 ? "#e85d38" : "#38e8a0" }}>
                        {g >= 0 ? "+" : ""}{fmt(g)} <span style={{ fontSize: 10, opacity: 0.7 }}>({pct(d)}%)</span>
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ color: reasonColor, background: `${reasonColor}18`, padding: "2px 8px", borderRadius: 3, fontSize: 11 }}>{d.declineReason}</span>
                    </td>
                    <td style={{ padding: "11px 14px", color: "#555", fontSize: 11 }}>{d.date}</td>
                    <td style={{ padding: "11px 14px", color: "#555", fontSize: 11, maxWidth: 280 }}>
                      {d.notes ? (
                        <span title={d.notes} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.notes}</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#444", fontSize: 13 }}>No records match the current filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
