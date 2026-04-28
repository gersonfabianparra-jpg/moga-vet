import T from "../../styles/tokens.js";

export default function KpiCard({ label, value, sub, gradient, icon, delay = "0" }) {
  return (
    <div
      className={`hover-lift fade-up-${delay}`}
      style={{
        background: gradient,
        borderRadius: 18,
        padding: "22px 24px",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
      }}
    >
      {/* Círculo decorativo */}
      <div style={{
        position: "absolute", top: -28, right: -28,
        width: 100, height: 100, borderRadius: "50%",
        background: "rgba(255,255,255,0.07)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -40, right: 20,
        width: 80, height: 80, borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        pointerEvents: "none",
      }} />

      {/* Icono */}
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: "rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, marginBottom: 14,
        backdropFilter: "blur(4px)",
      }}>
        {icon}
      </div>

      <div style={{
        fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)",
        textTransform: "uppercase", letterSpacing: "0.12em",
        marginBottom: 6, fontFamily: T.font,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 30, fontWeight: 800, color: "#fff",
        fontFamily: T.font, lineHeight: 1, letterSpacing: "-0.5px",
      }}>
        {value}
      </div>
      {sub && (
        <div style={{
          fontSize: 12, color: "rgba(255,255,255,0.6)",
          marginTop: 8, fontWeight: 500, fontFamily: T.font,
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}
