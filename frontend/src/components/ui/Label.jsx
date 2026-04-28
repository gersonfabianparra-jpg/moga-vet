import T from "../../styles/tokens.js";

export default function Label({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: T.textMuted,
      textTransform: "uppercase", letterSpacing: "0.08em",
      marginBottom: 6, fontFamily: T.font,
    }}>
      {children}
    </div>
  );
}
