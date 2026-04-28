import T from "../../styles/tokens.js";

export default function KpiCard({ label, value, sub, gradient, icon, delay = "0" }) {
  return (
    <div
      className={`hover-lift fade-up-${delay}`}
      style={{
        background:gradient, borderRadius:16, padding:"22px 24px",
        position:"relative", overflow:"hidden", boxShadow:T.md, cursor:"default",
      }}
    >
      <div style={{ position:"absolute", top:-20, right:-20, fontSize:72, opacity:0.12, lineHeight:1, userSelect:"none" }}>
        {icon}
      </div>
      <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.65)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10, fontFamily:T.font }}>
        {label}
      </div>
      <div style={{ fontSize:28, fontWeight:800, color:"#fff", fontFamily:T.font, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", marginTop:8, fontWeight:500 }}>{sub}</div>}
    </div>
  );
}
