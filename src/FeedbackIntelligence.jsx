import { useMemo } from "react";
import { THEME_DEFS } from "./feedbackThemes";

function analyze(records) {
  const withFeedback = records.filter((r) => r.notes?.trim());
  if (!withFeedback.length) return null;

  const themes = THEME_DEFS.map((def) => {
    const matches = withFeedback.filter((r) => {
      const text = r.notes.toLowerCase();
      return def.keywords.some((kw) => text.includes(kw));
    });
    return {
      ...def,
      count: matches.length,
      pct: Math.round((matches.length / withFeedback.length) * 100),
      quotes: matches
        .slice(0, 2)
        .map((r) => (r.notes.length > 140 ? r.notes.slice(0, 137) + "…" : r.notes)),
    };
  }).filter((t) => t.count > 0).sort((a, b) => b.count - a.count);

  // Build auto-summary sentence
  const top = themes.slice(0, 3);
  let summary = `Across ${withFeedback.length} responses with written feedback`;
  if (top.length) {
    const parts = top.map((t) => `${t.label.toLowerCase()} (${t.pct}%)`);
    summary += `, the primary drivers of decline are: ${parts.join(", ")}.`;
  } else {
    summary += ", no clear pattern emerged from keyword analysis.";
  }

  return { themes, totalWithFeedback: withFeedback.length, totalRecords: records.length, summary };
}

export default function FeedbackIntelligence({ records, theme: T }) {
  const result = useMemo(() => analyze(records), [records]);

  if (!result) return null;

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24, marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: T.textFaintest, textTransform: "uppercase", marginBottom: 4 }}>Smart Analysis</div>
          <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: T.text }}>Feedback Intelligence</div>
        </div>
        <div style={{ fontSize: 11, color: T.textFaintest, textAlign: "right" }}>
          <span style={{ color: T.accent }}>{result.totalWithFeedback}</span> of {result.totalRecords} records have feedback
        </div>
      </div>

      {/* Auto-summary */}
      <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.7, marginBottom: 20, padding: "12px 16px", background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 6, borderLeft: `3px solid ${T.accent}` }}>
        {result.summary}
      </div>

      {/* Theme bars */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {result.themes.map((t) => (
          <div key={t.label} style={{ padding: "14px 16px", background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 6 }}>
            {/* Label + count */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: t.color, fontWeight: 500 }}>{t.label}</span>
              <span style={{ fontSize: 11, color: T.textFaintest }}>{t.count} · {t.pct}%</span>
            </div>
            {/* Bar */}
            <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ height: "100%", width: `${t.pct}%`, background: t.color, borderRadius: 2, transition: "width 0.4s" }} />
            </div>
            {/* Sample quotes */}
            {t.quotes.map((q, qi) => (
              <div key={qi} style={{ fontSize: 10, color: T.textFaintest, lineHeight: 1.5, marginTop: 6, paddingLeft: 8, borderLeft: `2px solid ${t.color}40` }}>
                "{q}"
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
