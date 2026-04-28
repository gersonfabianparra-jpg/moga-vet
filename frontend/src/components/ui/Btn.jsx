import T from "../../styles/tokens.js";

const STYLES = {
  primary: { bg: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandMid} 100%)`, c: "#fff", border: "none" },
  accent:  { bg: `linear-gradient(135deg, #a06218 0%, ${T.gold} 100%)`, c: "#fff", border: "none" },
  ghost:   { bg: "transparent", c: T.textMid, border: `1.5px solid ${T.border}` },
  danger:  { bg: "linear-gradient(135deg, #7f1d1d, #dc2626)", c: "#fff", border: "none" },
  outline: { bg: "transparent", c: T.brand, border: `1.5px solid ${T.brand}` },
  sm:      { bg: T.brandLight, c: T.brand, border: "none", sm: true },
  sm_green:{ bg: T.green, c: T.greenText, border: "none", sm: true },
  sm_red:  { bg: T.red,   c: T.redText,   border: "none", sm: true },
  sm_gray: { bg: "#f1f5f9", c: "#475569", border: "none", sm: true },
  sm_amber:{ bg: T.amber, c: T.amberText, border: "none", sm: true },
};

export default function Btn({ v = "primary", style: s = {}, children, ...p }) {
  const st = STYLES[v] || STYLES.primary;
  return (
    <button
      className="moga-btn"
      style={{
        background: st.bg, color: st.c, border: st.border || "none",
        padding: st.sm ? "5px 12px" : "10px 22px",
        borderRadius: 10, cursor: "pointer",
        fontSize: st.sm ? 12 : 14, fontWeight: 600,
        fontFamily: T.font, display: "inline-flex", alignItems: "center", gap: 6,
        ...s,
      }}
      {...p}
    >
      {children}
    </button>
  );
}
