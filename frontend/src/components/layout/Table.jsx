import T from "../../styles/tokens.js";

export function TableWrap({ heads, children, empty }) {
  return (
    <div style={{ background:T.panel, borderRadius:16, boxShadow:T.sm, overflow:"hidden", border:`1px solid ${T.border}` }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:T.font }}>
        <thead>
          <tr style={{ background:T.appBg }}>
            {heads.map((h) => (
              <th key={h} style={{ padding:"12px 18px", textAlign:"left", fontSize:11, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && <div style={{ padding:48, textAlign:"center", color:T.textMuted, fontSize:14 }}>{empty}</div>}
    </div>
  );
}

export function TR({ children, ...p }) {
  return (
    <tr className="row-hover" style={{ borderTop:`1px solid ${T.border}`, transition:"background 0.12s", ...p.style }} {...p}>
      {children}
    </tr>
  );
}

export function TD({ children, bold, muted, style: s = {} }) {
  return (
    <td style={{ padding:"13px 18px", fontSize:14, color:muted ? T.textMuted : T.text, fontWeight:bold ? 700 : 400, ...s }}>
      {children}
    </td>
  );
}
