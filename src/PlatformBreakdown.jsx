import { useMemo } from "react";

const PLATFORM_META = {
  LinkedIn: { logo: "/linkedin_logo.png", color: "#0a66c2" },
  Indeed:   { logo: "/indeed_logo.png",   color: "#003a9b" },
  Alumni:   { logo: "/alumni_logo.png",   color: "#e8a838" },
  Referral: { logo: "/referral_logo.png", color: "#38e8a0" },
  Email:    { logo: null,                 color: "#b038e8" },
  Other:    { logo: null,                 color: "#666"    },
};

const EmailIcon = ({ color }) => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
    <path d="M6 18L28 32L50 18M6 18H50V42H6V18Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const OtherIcon = ({ color }) => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
    <circle cx="16" cy="28" r="5" fill={color} />
    <circle cx="28" cy="28" r="5" fill={color} />
    <circle cx="40" cy="28" r="5" fill={color} />
  </svg>
);

export default function PlatformBreakdown({ records, theme: T }) {
  const platforms = useMemo(() => {
    const counts = {};
    records.forEach((r) => {
      const p = r.platform || "Other";
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / records.length) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  const max = platforms[0]?.count ?? 1;

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24, marginBottom: 20 }}>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textFaintest, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Sourcing</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Platform Breakdown</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {platforms.map(({ name, count, pct }) => {
          const meta = PLATFORM_META[name] ?? PLATFORM_META.Other;
          return (
            <div
              key={name}
              style={{
                background: T.cardAlt,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {/* Logo banner */}
              <div style={{
                height: 120,
                background: `linear-gradient(135deg, ${meta.color}22 0%, ${meta.color}10 100%)`,
                borderBottom: `1px solid ${meta.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}>
                {/* Corner accent */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: meta.color }} />
                {meta.logo ? (
                  <img src={meta.logo} alt={name} style={{ width: 80, height: 80, objectFit: "contain" }} />
                ) : name === "Email" ? (
                  <EmailIcon color={meta.color} />
                ) : (
                  <OtherIcon color={meta.color} />
                )}
              </div>

              {/* Stats */}
              <div style={{ padding: "16px 18px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{name}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: meta.color, lineHeight: 1, letterSpacing: "-0.02em" }}>{pct}%</div>
                </div>
                <div style={{ fontSize: 11, color: T.textFaintest, marginBottom: 10 }}>{count} decline{count !== 1 ? "s" : ""}</div>
                <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(count / max) * 100}%`, background: meta.color, borderRadius: 2, transition: "width 0.5s" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
