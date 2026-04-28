import T from "../../styles/tokens.js";

export default function PageTitle({ icon, title, sub, action }) {
  return (
    <div style={{ padding:"28px 36px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{
          width:42, height:42, borderRadius:12,
          background:`linear-gradient(135deg, ${T.brand}, ${T.brandMid})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:20, boxShadow:"0 4px 12px rgba(10,46,28,0.25)",
        }}>
          {icon}
        </div>
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, color:T.text, fontFamily:T.font, lineHeight:1 }}>{title}</h1>
          {sub && <p style={{ fontSize:13, color:T.textMuted, marginTop:4, fontFamily:T.font }}>{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
