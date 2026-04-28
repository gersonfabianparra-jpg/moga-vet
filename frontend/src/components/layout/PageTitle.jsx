import T from "../../styles/tokens.js";

export default function PageTitle({ icon, title, sub, action }) {
  return (
    <div style={{
      padding: "28px 0 20px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13,
          background: `linear-gradient(135deg, ${T.brand}, ${T.brandMid})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
          boxShadow: `0 6px 18px rgba(5,150,105,0.3)`,
        }}>
          {icon}
        </div>
        <div>
          <h1 style={{
            fontSize: 22, fontWeight: 800, color: T.text,
            fontFamily: T.font, lineHeight: 1, letterSpacing: "-0.3px",
          }}>
            {title}
          </h1>
          {sub && (
            <p style={{
              fontSize: 13, color: T.textMuted,
              marginTop: 4, fontFamily: T.font,
            }}>
              {sub}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
