import T from "../../styles/tokens.js";

export default function Avatar({ name, size = 38, bg = T.brandMid }) {
  const ini = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0, fontFamily: T.font,
    }}>
      {ini}
    </div>
  );
}
