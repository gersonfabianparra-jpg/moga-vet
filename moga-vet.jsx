import { useState, useEffect, useRef } from "react";

// ─── FONT + GLOBAL CSS INJECTION ─────────────────────────────
function useGlobalStyle() {
  useEffect(() => {
    const id = "moga-style";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
      @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      .fade-up { animation: fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
      .fade-up-2 { animation: fadeUp 0.35s 0.05s cubic-bezier(0.22,1,0.36,1) both; }
      .fade-up-3 { animation: fadeUp 0.35s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
      .fade-up-4 { animation: fadeUp 0.35s 0.15s cubic-bezier(0.22,1,0.36,1) both; }
      .modal-enter { animation: scaleIn 0.2s cubic-bezier(0.22,1,0.36,1) both; }
      .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
      .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.14) !important; }
      .nav-item { transition: background 0.15s ease, color 0.15s ease; }
      .nav-item:hover { background: rgba(255,255,255,0.07) !important; color: rgba(255,255,255,0.95) !important; }
      .moga-input { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
      .moga-input:focus { border-color: #2d7a52 !important; box-shadow: 0 0 0 3px rgba(45,122,82,0.15) !important; outline: none; }
      .moga-btn { transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease; }
      .moga-btn:hover { opacity: 0.88; transform: translateY(-1px); }
      .moga-btn:active { transform: translateY(0); }
      .row-hover:hover { background: rgba(45,122,82,0.04) !important; }
      .tab-pill { transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease; }
      .tab-pill:hover { color: #111 !important; }
      .chip-select { transition: border-color 0.15s ease, background 0.15s ease; }
      .chip-select:hover { border-color: #2d7a52 !important; background: #f0faf5 !important; }
      .chip-select.active { background: #0a2e1c !important; color: #fff !important; border-color: #0a2e1c !important; }
    `;
    document.head.appendChild(style);
  }, []);
}

// ─── DESIGN TOKENS ───────────────────────────────────────────
const T = {
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontDisplay: "'Fraunces', Georgia, serif",
  // App
  appBg: "#f0ede6",
  panel: "#ffffff",
  panelAlt: "#fafaf7",
  // Sidebar
  sb: "#08180f",
  sbText: "rgba(255,255,255,0.5)",
  sbActive: "#ffffff",
  sbBorder: "rgba(255,255,255,0.07)",
  sbHighlight: "rgba(255,255,255,0.08)",
  // Brand
  brand: "#0a2e1c",
  brandMid: "#1d5c38",
  brandLight: "#e8f5ee",
  brandXLight: "#f4fbf6",
  // Gold accent
  gold: "#c07c1a",
  goldLight: "#fdf3e0",
  // Text
  text: "#111510",
  textMid: "#3d4a38",
  textMuted: "#7a8272",
  // Borders
  border: "rgba(0,0,0,0.07)",
  borderMid: "rgba(0,0,0,0.13)",
  // Shadows
  sm: "0 1px 3px rgba(0,0,0,0.06)",
  md: "0 4px 16px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
  lg: "0 12px 36px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.05)",
  xl: "0 28px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08)",
  // Status
  green: "#dcfce7", greenText: "#14532d", greenBg: "#f0fdf4",
  amber: "#fef3c7", amberText: "#78350f", amberBg: "#fffbeb",
  red: "#fee2e2", redText: "#7f1d1d", redBg: "#fef2f2",
  blue: "#dbeafe", blueText: "#1e3a8a", blueBg: "#eff6ff",
  purple: "#f3e8ff", purpleText: "#581c87",
};

// ─── DATA ────────────────────────────────────────────────────
const initUsers = [
  { id:1, name:"Dra. María González", email:"admin@moga.cl", password:"admin123", role:"admin", phone:"+56 9 1234 5678", avatar:"MG" },
  { id:2, name:"Dr. Carlos Pérez", email:"vet@moga.cl", password:"vet123", role:"vet", phone:"+56 9 8765 4321", avatar:"CP" },
  { id:3, name:"Ana Torres", email:"ana@email.cl", password:"123456", role:"client", rut:"12.345.678-9", phone:"+56 9 1111 2222" },
  { id:4, name:"Pedro Soto", email:"pedro@email.cl", password:"123456", role:"client", rut:"9.876.543-2", phone:"+56 9 3333 4444" },
];
const initPets = [
  { id:1, name:"Luna", species:"Perro", breed:"Labrador Dorado", age:3, weight:25.5, color:"Dorado", ownerId:3, gender:"Hembra", chip:"985141002123456" },
  { id:2, name:"Michi", species:"Gato", breed:"Siamés", age:5, weight:4.2, color:"Blanco/Café", ownerId:3, gender:"Macho", chip:"985141009876543" },
  { id:3, name:"Rocky", species:"Perro", breed:"Bulldog Francés", age:2, weight:12.0, color:"Atigrado", ownerId:4, gender:"Macho", chip:"985141005432198" },
  { id:4, name:"Nala", species:"Perro", breed:"Golden Retriever", age:4, weight:28.0, color:"Dorado oscuro", ownerId:4, gender:"Hembra", chip:"985141001357924" },
];
const initRecords = [
  { id:1, petId:1, date:"2024-01-15", vet:"Dra. María González", type:"Control", diagnosis:"Animal sano, control rutinario", treatment:"Vacuna antirrábica y desparasitación", weight:24.8, temperature:"38.5", notes:"Mascota en excelente condición corporal.", nextVisit:"2025-01-15" },
  { id:2, petId:1, date:"2024-07-20", vet:"Dr. Carlos Pérez", type:"Urgencia", diagnosis:"Otitis externa bilateral leve", treatment:"Limpieza ótica + Otospray 7 días", weight:25.2, temperature:"38.8", notes:"Control en 10 días si no mejora.", nextVisit:"2024-07-30" },
  { id:3, petId:2, date:"2024-03-10", vet:"Dra. María González", type:"Control", diagnosis:"Control anual. Vacunas al día.", treatment:"Vacuna triple felina", weight:4.0, temperature:"38.3", notes:"Peso en rango ideal para la raza.", nextVisit:"2025-03-10" },
  { id:4, petId:3, date:"2024-09-05", vet:"Dr. Carlos Pérez", type:"Control", diagnosis:"Revisión dental. Sarro moderado.", treatment:"Limpieza dental programada bajo anestesia", weight:11.8, temperature:"38.6", notes:"Traer en ayunas de 8 horas.", nextVisit:"2024-10-01" },
  { id:5, petId:4, date:"2024-11-20", vet:"Dra. María González", type:"Control", diagnosis:"Control post-operatorio esterilización", treatment:"Antibiótico 5 días + AINE 3 días", weight:27.5, temperature:"38.4", notes:"Cicatrización excelente.", nextVisit:"2024-12-05" },
];
const initGrooming = [
  { id:1, petId:1, clientId:3, date:"2026-04-28", time:"10:00", service:"Baño y corte completo", status:"confirmada", notes:"Traer sin collar", price:18000 },
  { id:2, petId:3, clientId:4, date:"2026-05-02", time:"14:30", service:"Baño y secado", status:"pendiente", notes:"Shampoo hipoalergénico", price:12000 },
  { id:3, petId:2, clientId:3, date:"2026-04-20", time:"11:00", service:"Corte de uñas + limpieza ótica", status:"completada", notes:"", price:8000 },
  { id:4, petId:4, clientId:4, date:"2026-05-05", time:"09:00", service:"Baño y corte completo", status:"confirmada", notes:"", price:20000 },
  { id:5, petId:2, clientId:3, date:"2026-05-12", time:"15:00", service:"Baño y secado", status:"pendiente", notes:"", price:10000 },
];
const initPayments = [
  { id:1, concept:"Consulta — Control rutinario Luna", petId:1, clientId:3, date:"2024-01-15", amount:25000, category:"Consulta", status:"pagado", method:"Débito" },
  { id:2, concept:"Urgencia — Otitis externa Luna", petId:1, clientId:3, date:"2024-07-20", amount:45000, category:"Urgencia", status:"pagado", method:"Efectivo" },
  { id:3, concept:"Consulta — Control anual Michi", petId:2, clientId:3, date:"2024-03-10", amount:25000, category:"Consulta", status:"pagado", method:"Transferencia" },
  { id:4, concept:"Limpieza dental Rocky", petId:3, clientId:4, date:"2024-09-05", amount:85000, category:"Procedimiento", status:"pagado", method:"Crédito" },
  { id:5, concept:"Cirugía esterilización Nala", petId:4, clientId:4, date:"2024-11-20", amount:180000, category:"Cirugía", status:"pagado", method:"Transferencia" },
  { id:6, concept:"Peluquería — Corte uñas Michi", petId:2, clientId:3, date:"2026-04-20", amount:8000, category:"Peluquería", status:"pagado", method:"Efectivo" },
  { id:7, concept:"Peluquería — Baño y corte Luna", petId:1, clientId:3, date:"2026-04-28", amount:18000, category:"Peluquería", status:"pendiente", method:null },
  { id:8, concept:"Peluquería — Baño Rocky", petId:3, clientId:4, date:"2026-05-02", amount:12000, category:"Peluquería", status:"pendiente", method:null },
  { id:9, concept:"Peluquería — Baño y corte Nala", petId:4, clientId:4, date:"2026-05-05", amount:20000, category:"Peluquería", status:"pendiente", method:null },
];
const initVaccines = [
  { id:1, petId:1, name:"Antirrábica", dateApplied:"2025-01-15", nextDue:"2026-01-15", vet:"Dra. María González", lot:"VR2025-A01" },
  { id:2, petId:1, name:"Sétuple canina", dateApplied:"2025-01-15", nextDue:"2026-01-15", vet:"Dra. María González", lot:"SC2025-B02" },
  { id:3, petId:2, name:"Triple felina", dateApplied:"2025-03-10", nextDue:"2026-03-10", vet:"Dra. María González", lot:"TF2025-C03" },
  { id:4, petId:2, name:"Leucemia felina", dateApplied:"2025-03-10", nextDue:"2026-05-10", vet:"Dra. María González", lot:"LF2025-D04" },
  { id:5, petId:3, name:"Antirrábica", dateApplied:"2025-09-01", nextDue:"2026-09-01", vet:"Dr. Carlos Pérez", lot:"VR2025-E05" },
  { id:6, petId:3, name:"Sétuple canina", dateApplied:"2025-09-05", nextDue:"2026-09-05", vet:"Dr. Carlos Pérez", lot:"SC2025-F06" },
  { id:7, petId:4, name:"Antirrábica", dateApplied:"2025-11-20", nextDue:"2026-11-20", vet:"Dra. María González", lot:"VR2025-G07" },
  { id:8, petId:4, name:"Sétuple canina", dateApplied:"2025-11-20", nextDue:"2026-11-20", vet:"Dra. María González", lot:"SC2025-H08" },
];

// ─── HELPERS ─────────────────────────────────────────────────
const TODAY = new Date("2026-04-26");
const fmtCLP = n => `$${Number(n).toLocaleString("es-CL")}`;
const fmtDate = d => { if (!d) return "—"; const [y,m,day]=d.split("-"); return `${day}/${m}/${y}`; };
const spIcon = s => s==="Gato" ? "🐈" : "🐕";
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_S = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const SERVICES = ["Baño y corte completo","Baño y secado","Corte de uñas + limpieza ótica","Spa completo","Solo baño"];
const VACCINES_LIST = ["Antirrábica","Sétuple canina","Triple felina","Leucemia felina","Bordetella","Otra"];
const PAY_METHODS = ["Efectivo","Débito","Crédito","Transferencia"];
const PAY_CATS = ["Consulta","Urgencia","Procedimiento","Cirugía","Peluquería"];

const vaxStatus = d => {
  const diff = Math.round((new Date(d) - TODAY) / 86400000);
  if (diff < 0)  return { key:"red",   dot:"#ef4444", label:`Vencida hace ${Math.abs(diff)}d`, short:"Vencida" };
  if (diff <= 30) return { key:"amber", dot:"#f59e0b", label:`Vence en ${diff} días`,           short:"Próxima" };
  return           { key:"green", dot:"#22c55e", label:`Al día (${diff}d)`,              short:"Al día" };
};

const calDays = (y, m) => {
  const first = new Date(y, m, 1), last = new Date(y, m+1, 0);
  const pad = (first.getDay()+6)%7;
  const d = Array(pad).fill(null);
  for (let i=1;i<=last.getDate();i++) d.push(i);
  return d;
};

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────
const Dot = ({ color }) => <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:color,flexShrink:0,marginTop:1}}/>;

const StatusBadge = ({ status }) => {
  const cfg = { confirmada:{bg:T.green,c:T.greenText,dot:"#22c55e",l:"Confirmada"}, pendiente:{bg:T.amber,c:T.amberText,dot:"#f59e0b",l:"Pendiente"}, completada:{bg:"#f1f5f9",c:"#475569",dot:"#94a3b8",l:"Completada"}, cancelada:{bg:T.red,c:T.redText,dot:"#ef4444",l:"Cancelada"} };
  const s = cfg[status] || cfg.pendiente;
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:s.bg,color:s.c,fontSize:12,fontWeight:600}}><Dot color={s.dot}/>{s.l}</span>;
};

const TypeBadge = ({ type }) => {
  const cfg = { Control:{bg:T.blueBg,c:T.blueText}, Urgencia:{bg:T.redBg,c:T.redText}, Cirugía:{bg:T.amberBg,c:T.amberText}, Vacunación:{bg:T.green,c:T.greenText} };
  const s = cfg[type] || {bg:"#f1f5f9",c:"#475569"};
  return <span style={{padding:"3px 10px",borderRadius:20,background:s.bg,color:s.c,fontSize:12,fontWeight:600}}>{type}</span>;
};

const VaxBadge = ({ nextDue }) => {
  const s = vaxStatus(nextDue);
  const cfg = { red:{bg:T.redBg,c:T.redText}, amber:{bg:T.amberBg,c:T.amberText}, green:{bg:T.greenBg,c:T.greenText} };
  const {bg,c} = cfg[s.key];
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:bg,color:c,fontSize:12,fontWeight:600}}><Dot color={s.dot}/>{s.short}</span>;
};

const CatBadge = ({ cat }) => {
  const cfg = { Consulta:{bg:T.blueBg,c:T.blueText}, Urgencia:{bg:T.redBg,c:T.redText}, Cirugía:{bg:T.amberBg,c:T.amberText}, Procedimiento:{bg:T.purple,c:T.purpleText}, Peluquería:{bg:T.greenBg,c:T.greenText} };
  const s = cfg[cat]||{bg:"#f1f5f9",c:"#475569"};
  return <span style={{padding:"3px 10px",borderRadius:20,background:s.bg,color:s.c,fontSize:12,fontWeight:600}}>{cat}</span>;
};

const Avatar = ({ name, size=38, bg=T.brandMid }) => {
  const ini = name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"50%",background:bg,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:700,flexShrink:0,fontFamily:T.font}}>{ini}</div>;
};

const Label = ({ children }) => <div style={{fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6,fontFamily:T.font}}>{children}</div>;

const Input = ({ label, textarea, ...p }) => (
  <div style={{marginBottom:16}}>
    {label && <Label>{label}</Label>}
    {textarea
      ? <textarea className="moga-input" style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,color:T.text,background:T.panel,fontFamily:T.font,resize:"vertical",minHeight:80}} {...p}/>
      : <input className="moga-input" style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,color:T.text,background:T.panel,fontFamily:T.font}} {...p}/>
    }
  </div>
);

const Select = ({ label, children, ...p }) => (
  <div style={{marginBottom:16}}>
    {label && <Label>{label}</Label>}
    <select className="moga-input" style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,color:T.text,background:T.panel,fontFamily:T.font,cursor:"pointer"}} {...p}>{children}</select>
  </div>
);

const Btn = ({ v="primary", style:s={}, children, ...p }) => {
  const styles = {
    primary:  {bg:`linear-gradient(135deg, ${T.brand} 0%, ${T.brandMid} 100%)`, c:"#fff", border:"none"},
    accent:   {bg:`linear-gradient(135deg, #a06218 0%, ${T.gold} 100%)`, c:"#fff", border:"none"},
    ghost:    {bg:"transparent", c:T.textMid, border:`1.5px solid ${T.border}`},
    danger:   {bg:`linear-gradient(135deg, #7f1d1d, #dc2626)`, c:"#fff", border:"none"},
    outline:  {bg:"transparent", c:T.brand, border:`1.5px solid ${T.brand}`},
    sm:       {bg:T.brandLight, c:T.brand, border:"none", sm:true},
    sm_green: {bg:T.green, c:T.greenText, border:"none", sm:true},
    sm_red:   {bg:T.red, c:T.redText, border:"none", sm:true},
    sm_gray:  {bg:"#f1f5f9", c:"#475569", border:"none", sm:true},
    sm_amber: {bg:T.amber, c:T.amberText, border:"none", sm:true},
  };
  const st = styles[v] || styles.primary;
  return (
    <button className="moga-btn" style={{
      background:st.bg, color:st.c, border:st.border||"none",
      padding: st.sm ? "5px 12px" : "10px 22px",
      borderRadius: 10, cursor:"pointer",
      fontSize: st.sm ? 12 : 14, fontWeight:600,
      fontFamily:T.font, display:"inline-flex", alignItems:"center", gap:6, ...s
    }} {...p}>{children}</button>
  );
};

const Modal = ({ title, sub, onClose, children, wide }) => (
  <div style={{position:"fixed",inset:0,background:"rgba(8,24,15,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20,backdropFilter:"blur(4px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal-enter" style={{background:T.panel,borderRadius:20,width:wide?720:520,maxWidth:"100%",maxHeight:"92vh",overflow:"auto",boxShadow:T.xl}}>
      <div style={{padding:"24px 28px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:T.text,fontFamily:T.font}}>{title}</div>
          {sub && <div style={{fontSize:13,color:T.textMuted,marginTop:3}}>{sub}</div>}
        </div>
        <button onClick={onClose} style={{background:T.appBg,border:"none",cursor:"pointer",color:T.textMuted,width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,transition:"background 0.15s"}}>✕</button>
      </div>
      <div style={{padding:28}}>{children}</div>
    </div>
  </div>
);

// ─── KPI CARD ────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, gradient, icon, delay="0" }) => (
  <div className={`hover-lift fade-up-${delay}`} style={{background:gradient,borderRadius:16,padding:"22px 24px",position:"relative",overflow:"hidden",boxShadow:T.md,cursor:"default"}}>
    <div style={{position:"absolute",top:-20,right:-20,fontSize:72,opacity:0.12,lineHeight:1,userSelect:"none"}}>{icon}</div>
    <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.65)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10,fontFamily:T.font}}>{label}</div>
    <div style={{fontSize:28,fontWeight:800,color:"#fff",fontFamily:T.font,lineHeight:1}}>{value}</div>
    {sub && <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",marginTop:8,fontWeight:500}}>{sub}</div>}
  </div>
);

// ─── SECTION HEADER ──────────────────────────────────────────
const PageTitle = ({ icon, title, sub, action }) => (
  <div style={{padding:"28px 36px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg, ${T.brand}, ${T.brandMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:`0 4px 12px rgba(10,46,28,0.25)`}}>{icon}</div>
      <div>
        <h1 style={{fontSize:20,fontWeight:800,color:T.text,fontFamily:T.font,lineHeight:1}}>{title}</h1>
        {sub && <p style={{fontSize:13,color:T.textMuted,marginTop:4,fontFamily:T.font}}>{sub}</p>}
      </div>
    </div>
    {action}
  </div>
);

// ─── TABLE WRAPPER ───────────────────────────────────────────
const TableWrap = ({ heads, children, empty }) => (
  <div style={{background:T.panel,borderRadius:16,boxShadow:T.sm,overflow:"hidden",border:`1px solid ${T.border}`}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontFamily:T.font}}>
      <thead>
        <tr style={{background:T.appBg}}>
          {heads.map(h=><th key={h} style={{padding:"12px 18px",textAlign:"left",fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</th>)}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
    {empty && <div style={{padding:48,textAlign:"center",color:T.textMuted,fontSize:14}}>{empty}</div>}
  </div>
);

const TR = ({ children, ...p }) => (
  <tr className="row-hover" style={{borderTop:`1px solid ${T.border}`,transition:"background 0.12s",...p.style}} {...p}>{children}</tr>
);
const TD = ({ children, bold, muted, style:s={} }) => (
  <td style={{padding:"13px 18px",fontSize:14,color:muted?T.textMuted:T.text,fontWeight:bold?700:400,...s}}>{children}</td>
);

// ─── SIDEBAR ─────────────────────────────────────────────────
function Sidebar({ user, activeTab, onTab, onLogout, badges }) {
  const nav = [
    {id:"overview",icon:"⬡",label:"Inicio"},
    {id:"pets",icon:"🐾",label:"Mascotas"},
    {id:"records",icon:"📋",label:"Fichas médicas"},
    {id:"grooming",icon:"✂️",label:"Peluquería"},
    {id:"vaccines",icon:"💉",label:"Vacunas",badge:badges.vaccines},
    {id:"payments",icon:"💳",label:"Pagos",badge:badges.payments},
    {id:"users",icon:"👥",label:"Clientes"},
  ];

  return (
    <div style={{width:230,background:T.sb,display:"flex",flexDirection:"column",flexShrink:0,height:"100vh",position:"sticky",top:0}}>
      {/* Logo */}
      <div style={{padding:"28px 22px 20px",borderBottom:`1px solid ${T.sbBorder}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,#1d6b3f,#2d9a5c)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 4px 12px rgba(45,154,92,0.4)"}}>🐾</div>
          <div>
            <div style={{fontFamily:T.fontDisplay,fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"0.04em",lineHeight:1}}>MOGA</div>
            <div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:"0.15em",marginTop:2}}>VETERINARIA</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{flex:1,padding:"12px 10px",overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
        {nav.map(n=>{
          const active = activeTab===n.id;
          return (
            <button key={n.id} className="nav-item" onClick={()=>onTab(n.id)} style={{
              display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",border:"none",cursor:"pointer",
              borderRadius:10,fontFamily:T.font,fontSize:13.5,fontWeight:active?700:400,textAlign:"left",
              background:active?"rgba(255,255,255,0.1)":"transparent",
              color:active?"#fff":T.sbText,
              justifyContent:"space-between",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16,width:20,textAlign:"center"}}>{n.icon}</span>
                {n.label}
              </div>
              {n.badge>0 && <span style={{background:"#dc2626",color:"#fff",borderRadius:10,fontSize:11,fontWeight:700,padding:"1px 7px",minWidth:20,textAlign:"center"}}>{n.badge}</span>}
            </button>
          );
        })}
      </nav>
      {/* User */}
      <div style={{padding:"14px 14px 18px",borderTop:`1px solid ${T.sbBorder}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,0.05)"}}>
          <Avatar name={user.name} size={34} bg={T.gold}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:"#fff",fontSize:13,fontWeight:700,fontFamily:T.font,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name.split(" ")[0]} {user.name.split(" ").slice(-1)[0]}</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:11,textTransform:"capitalize",fontFamily:T.font}}>{user.role==="admin"?"Administrador":"Veterinario/a"}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{width:"100%",padding:"8px",background:"transparent",border:`1px solid rgba(255,255,255,0.1)`,color:"rgba(255,255,255,0.4)",borderRadius:8,cursor:"pointer",fontSize:12,fontFamily:T.font,transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.25)";e.currentTarget.style.color="rgba(255,255,255,0.7)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="rgba(255,255,255,0.4)";}}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────
function LoginScreen({ users, onLogin }) {
  useGlobalStyle();
  const [tab,setTab]=useState("staff");
  const [email,setEmail]=useState(""); const [pw,setPw]=useState(""); const [rut,setRut]=useState(""); const [err,setErr]=useState("");

  const doStaff=()=>{ const u=users.find(u=>u.email===email&&u.password===pw&&u.role!=="client"); if(u){onLogin(u);}else setErr("Credenciales incorrectas."); };
  const doClient=()=>{ const q=rut.trim(); const u=users.find(u=>u.role==="client"&&(u.rut===q||u.email===q)); if(u){onLogin(u);}else setErr("Sin resultados para ese RUT o correo."); };

  return (
    <div style={{minHeight:"100vh",display:"grid",gridTemplateColumns:"1fr 1fr",fontFamily:T.font}}>
      {/* Left panel */}
      <div style={{background:`linear-gradient(160deg, #061008 0%, #0d2e1a 50%, #1a4731 100%)`,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"48px 52px",position:"relative",overflow:"hidden"}}>
        {/* Decorative circles */}
        <div style={{position:"absolute",top:-80,right:-80,width:320,height:320,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.04)"}}/>
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.06)"}}/>
        <div style={{position:"absolute",bottom:60,left:-100,width:280,height:280,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.04)"}}/>
        <div style={{position:"absolute",bottom:100,right:80,width:8,height:8,borderRadius:"50%",background:"rgba(45,154,92,0.6)"}}/>
        <div style={{position:"absolute",top:200,left:200,width:5,height:5,borderRadius:"50%",background:"rgba(192,124,26,0.7)"}}/>
        {/* Logo */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:60}}>
            <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,#1d6b3f,#2d9a5c)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 6px 20px rgba(45,154,92,0.35)"}}>🐾</div>
            <div style={{fontFamily:T.fontDisplay,fontSize:28,fontWeight:900,color:"#fff",letterSpacing:"0.04em"}}>MOGA</div>
          </div>
          <h2 style={{fontSize:38,fontWeight:900,color:"#fff",fontFamily:T.fontDisplay,lineHeight:1.1,marginBottom:16}}>La clínica de tus mascotas, en un solo lugar.</h2>
          <p style={{fontSize:15,color:"rgba(255,255,255,0.5)",lineHeight:1.7,maxWidth:380}}>Gestión integral de fichas médicas, vacunas, peluquería y más. Acceso para el equipo y para los dueños.</p>
        </div>
        {/* Features */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[["📋","Fichas médicas completas"],["💉","Alertas de vacunación"],["✂️","Agenda de peluquería"],["💳","Historial de pagos"]].map(([ic,tx])=>(
            <div key={tx} style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{ic}</div>
              <span style={{fontSize:14,color:"rgba(255,255,255,0.6)",fontFamily:T.font}}>{tx}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Right panel */}
      <div style={{background:T.appBg,display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
        <div className="fade-up" style={{width:"100%",maxWidth:400}}>
          <h3 style={{fontSize:24,fontWeight:800,color:T.text,fontFamily:T.font,marginBottom:6}}>Iniciar sesión</h3>
          <p style={{fontSize:14,color:T.textMuted,marginBottom:28}}>Selecciona tu tipo de acceso</p>
          {/* Tab toggle */}
          <div style={{display:"flex",background:T.panel,borderRadius:12,padding:4,marginBottom:28,boxShadow:T.sm}}>
            {[["staff","👨‍⚕️ Personal MOGA"],["client","🐾 Mis mascotas"]].map(([id,lbl])=>(
              <button key={id} onClick={()=>{setTab(id);setErr("");}} style={{flex:1,padding:"9px 0",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,borderRadius:10,fontFamily:T.font,transition:"all 0.2s",background:tab===id?T.brand:"transparent",color:tab===id?"#fff":T.textMuted,boxShadow:tab===id?T.sm:"none"}}>{lbl}</button>
            ))}
          </div>
          {/* Form */}
          <div style={{background:T.panel,borderRadius:16,padding:"28px",boxShadow:T.md}}>
            {tab==="staff"?(<>
              <Input label="Correo electrónico" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@moga.cl"/>
              <Input label="Contraseña" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••"/>
              {err&&<div style={{color:T.redText,fontSize:13,marginBottom:14,padding:"10px 14px",background:T.red,borderRadius:8}}>{err}</div>}
              <Btn style={{width:"100%",justifyContent:"center"}} onClick={doStaff}>Iniciar sesión →</Btn>
              <div style={{marginTop:20,padding:"14px",background:T.appBg,borderRadius:10,fontSize:12,color:T.textMuted,lineHeight:1.9}}>
                <strong style={{color:T.textMid}}>Admin:</strong> admin@moga.cl / admin123<br/>
                <strong style={{color:T.textMid}}>Veterinario:</strong> vet@moga.cl / vet123
              </div>
            </>):(<>
              <p style={{fontSize:14,color:T.textMuted,marginBottom:16,lineHeight:1.6}}>Ingresa tu RUT o correo para ver el historial de tus mascotas y agendar peluquería.</p>
              <Input label="RUT o correo" value={rut} onChange={e=>setRut(e.target.value)} placeholder="12.345.678-9"/>
              {err&&<div style={{color:T.redText,fontSize:13,marginBottom:14,padding:"10px 14px",background:T.red,borderRadius:8}}>{err}</div>}
              <Btn style={{width:"100%",justifyContent:"center"}} onClick={doClient}>Buscar mis mascotas →</Btn>
              <div style={{marginTop:20,padding:"14px",background:T.appBg,borderRadius:10,fontSize:12,color:T.textMuted,lineHeight:1.9}}>
                <strong style={{color:T.textMid}}>Ana Torres:</strong> RUT 12.345.678-9<br/>
                <strong style={{color:T.textMid}}>Pedro Soto:</strong> RUT 9.876.543-2
              </div>
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW ────────────────────────────────────────────────
function OverviewTab({ pets, records, grooming, users, payments, vaccines }) {
  const clients=users.filter(u=>u.role==="client");
  const today=TODAY.toISOString().slice(0,10);
  const upcoming=[...grooming].filter(g=>g.date>=today&&g.status!=="cancelada").sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);
  const totalPaid=payments.filter(p=>p.status==="pagado").reduce((s,p)=>s+p.amount,0);
  const totalPending=payments.filter(p=>p.status==="pendiente").reduce((s,p)=>s+p.amount,0);
  const urgentVax=vaccines.filter(v=>vaxStatus(v.nextDue).key!=="green");

  return (
    <div style={{padding:"0 36px 36px"}}>
      <PageTitle icon="⬡" title="Panel principal" sub={`${fmtDate(today)} — Bienvenido a MOGA`}/>
      {/* Alerts */}
      {urgentVax.length>0&&(
        <div style={{background:`linear-gradient(135deg,#7c2d12,#9a3412)`,borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",gap:14,alignItems:"center",boxShadow:`0 4px 16px rgba(154,52,18,0.3)`}}>
          <span style={{fontSize:22}}>💉</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,color:"#fff",fontSize:14,marginBottom:3}}>
              {urgentVax.length} vacuna{urgentVax.length!==1?"s":""} requiere{urgentVax.length===1?"":"n"} atención
            </div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>
              {urgentVax.slice(0,3).map(v=>{const pet=pets.find(p=>p.id===v.petId);const st=vaxStatus(v.nextDue);return `${pet?.name}: ${v.name} · ${st.short}`;}).join(" — ")}
            </div>
          </div>
        </div>
      )}
      {/* KPI Grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        <KpiCard label="Mascotas registradas" value={pets.length} icon="🐾" gradient={`linear-gradient(135deg, ${T.brand} 0%, ${T.brandMid} 100%)`} delay="2"/>
        <KpiCard label="Clientes activos" value={clients.length} icon="👥" gradient="linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)" delay="3"/>
        <KpiCard label="Ingresos totales" value={fmtCLP(totalPaid)} icon="💵" gradient={`linear-gradient(135deg, #78350f 0%, ${T.gold} 100%)`} delay="4"/>
        <KpiCard label="Por cobrar" value={fmtCLP(totalPending)} icon="⏳" gradient="linear-gradient(135deg, #3b0764, #7c3aed)" delay="4"/>
      </div>
      {/* Lower grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        {/* Upcoming */}
        <div style={{background:T.panel,borderRadius:16,boxShadow:T.sm,border:`1px solid ${T.border}`,overflow:"hidden"}}>
          <div style={{padding:"18px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:15,fontWeight:700,color:T.text,fontFamily:T.font}}>✂️ Próximas citas</div>
            <span style={{fontSize:12,color:T.textMuted,fontFamily:T.font}}>{upcoming.length} pendientes</span>
          </div>
          <div style={{padding:"8px 0"}}>
            {upcoming.length===0&&<div style={{padding:"24px",textAlign:"center",color:T.textMuted,fontSize:14}}>Sin citas próximas</div>}
            {upcoming.map(g=>{const pet=pets.find(p=>p.id===g.petId),client=users.find(u=>u.id===g.clientId);return(
              <div key={g.id} style={{padding:"12px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:T.brandLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{spIcon(pet?.species)}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,fontFamily:T.font,color:T.text}}>{pet?.name} <span style={{fontWeight:400,color:T.textMuted}}>· {client?.name}</span></div>
                    <div style={{fontSize:12,color:T.textMuted,marginTop:1}}>{g.service} · {fmtDate(g.date)} {g.time}</div>
                  </div>
                </div>
                <StatusBadge status={g.status}/>
              </div>
            );})}
          </div>
        </div>
        {/* Vaccines alert */}
        <div style={{background:T.panel,borderRadius:16,boxShadow:T.sm,border:`1px solid ${T.border}`,overflow:"hidden"}}>
          <div style={{padding:"18px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:15,fontWeight:700,color:T.text,fontFamily:T.font}}>💉 Estado vacunas</div>
            <span style={{fontSize:12,color:urgentVax.length>0?T.amberText:T.greenText,fontWeight:600,fontFamily:T.font}}>{urgentVax.length===0?"✓ Todas al día":`${urgentVax.length} alertas`}</span>
          </div>
          <div style={{padding:"8px 0"}}>
            {urgentVax.length===0&&<div style={{padding:"24px",textAlign:"center",color:T.textMuted,fontSize:14}}>✅ Todas las vacunas están al día</div>}
            {urgentVax.slice(0,5).map(v=>{const pet=pets.find(p=>p.id===v.petId);const st=vaxStatus(v.nextDue);return(
              <div key={v.id} style={{padding:"11px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:T.brandLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{spIcon(pet?.species)}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,fontFamily:T.font}}>{pet?.name}</div>
                    <div style={{fontSize:12,color:T.textMuted}}>{v.name}</div>
                  </div>
                </div>
                <VaxBadge nextDue={v.nextDue}/>
              </div>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PETS TAB ────────────────────────────────────────────────
function PetsTab({ pets, users, records, vaccines, onAddPet }) {
  const [search,setSearch]=useState(""); const [modal,setModal]=useState(false); const [selected,setSelected]=useState(null);
  const [form,setForm]=useState({name:"",species:"Perro",breed:"",age:"",weight:"",color:"",gender:"Hembra",chip:"",ownerId:""});
  const clients=users.filter(u=>u.role==="client");
  const filtered=pets.filter(p=>[p.name,p.breed].join(" ").toLowerCase().includes(search.toLowerCase()));
  const save=()=>{if(!form.name||!form.ownerId)return;onAddPet({...form,age:+form.age,weight:+form.weight,ownerId:+form.ownerId});setModal(false);setForm({name:"",species:"Perro",breed:"",age:"",weight:"",color:"",gender:"Hembra",chip:"",ownerId:""});};

  if(selected){
    const owner=users.find(u=>u.id===selected.ownerId);
    const petRecs=records.filter(r=>r.petId===selected.id).sort((a,b)=>b.date.localeCompare(a.date));
    const petVax=vaccines.filter(v=>v.petId===selected.id);
    return (
      <div style={{padding:"0 36px 36px"}}>
        <div style={{paddingTop:28,marginBottom:16}}>
          <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:T.font,display:"flex",alignItems:"center",gap:6,padding:0}}>← Volver a mascotas</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:20}}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:T.panel,borderRadius:16,boxShadow:T.md,overflow:"hidden"}}>
              <div style={{background:`linear-gradient(160deg, ${T.brand}, ${T.brandMid})`,padding:"28px 24px",textAlign:"center"}}>
                <div style={{fontSize:64,marginBottom:8,filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.3))"}}>{spIcon(selected.species)}</div>
                <div style={{fontSize:24,fontWeight:800,color:"#fff",fontFamily:T.font}}>{selected.name}</div>
                <div style={{fontSize:14,color:"rgba(255,255,255,0.65)",marginTop:3}}>{selected.breed}</div>
              </div>
              <div style={{padding:"16px 20px"}}>
                {[["Especie",selected.species],["Género",selected.gender],["Edad",`${selected.age} años`],["Peso",`${selected.weight} kg`],["Color",selected.color],["Microchip",selected.chip||"No registrado"]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`,fontSize:13,fontFamily:T.font}}>
                    <span style={{color:T.textMuted}}>{k}</span><span style={{fontWeight:600,color:T.text}}>{v}</span>
                  </div>
                ))}
              </div>
              {owner&&<div style={{margin:"0 16px 16px",background:T.appBg,borderRadius:10,padding:"12px 14px"}}>
                <Label>Propietario</Label>
                <div style={{fontSize:14,fontWeight:700,color:T.text}}>{owner.name}</div>
                <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{owner.rut} · {owner.phone}</div>
              </div>}
            </div>
            {/* Vaccines */}
            <div style={{background:T.panel,borderRadius:16,boxShadow:T.sm,border:`1px solid ${T.border}`,padding:"18px 20px"}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12,fontFamily:T.font}}>💉 Vacunas</div>
              {petVax.length===0&&<div style={{color:T.textMuted,fontSize:13}}>Sin vacunas registradas.</div>}
              {petVax.map(v=>{const st=vaxStatus(v.nextDue);return(
                <div key={v.id} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:13,fontWeight:600,fontFamily:T.font,color:T.text}}>{v.name}</div><div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{fmtDate(v.dateApplied)} → {fmtDate(v.nextDue)}</div></div>
                  <VaxBadge nextDue={v.nextDue}/>
                </div>
              );})}
            </div>
          </div>
          {/* Timeline records */}
          <div style={{background:T.panel,borderRadius:16,boxShadow:T.md,padding:"24px 28px"}}>
            <div style={{fontSize:18,fontWeight:800,color:T.text,fontFamily:T.font,marginBottom:24}}>📋 Historial médico</div>
            {petRecs.length===0&&<div style={{color:T.textMuted,fontSize:14}}>Sin fichas médicas registradas.</div>}
            <div style={{position:"relative"}}>
              {petRecs.length>1&&<div style={{position:"absolute",left:19,top:20,bottom:20,width:2,background:T.border}}/>}
              {petRecs.map((r,i)=>{
                const typCfg={Control:{c:T.blueText,bg:T.blue},Urgencia:{c:T.redText,bg:T.red},Cirugía:{c:T.amberText,bg:T.amber},Vacunación:{c:T.greenText,bg:T.green}};
                const tc=typCfg[r.type]||{c:T.textMuted,bg:T.appBg};
                return(
                  <div key={r.id} style={{display:"flex",gap:18,marginBottom:i===petRecs.length-1?0:24,position:"relative",zIndex:1}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:tc.bg,border:`3px solid ${T.panel}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,boxShadow:T.sm}}>
                      {r.type==="Urgencia"?"🚨":r.type==="Cirugía"?"🔬":r.type==="Vacunación"?"💉":"📋"}
                    </div>
                    <div style={{flex:1,background:T.appBg,borderRadius:12,padding:"16px 18px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div>
                          <span style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:T.font}}>{fmtDate(r.date)}</span>
                          <span style={{marginLeft:10}}><TypeBadge type={r.type}/></span>
                        </div>
                        <span style={{fontSize:12,color:T.textMuted,fontFamily:T.font}}>{r.vet}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 16px",marginBottom:r.notes?10:0}}>
                        {[["Diagnóstico",r.diagnosis],["Tratamiento",r.treatment||"—"],["Peso",`${r.weight} kg`],["Temperatura",`${r.temperature}°C`]].map(([k,v])=>(
                          <div key={k}><div style={{fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>{k}</div><div style={{fontSize:13,color:T.text}}>{v}</div></div>
                        ))}
                      </div>
                      {r.notes&&<div style={{fontSize:13,color:T.textMuted,background:T.panel,padding:"8px 12px",borderRadius:8,marginTop:8,borderLeft:`3px solid ${T.brand}`,lineHeight:1.5}}>📝 {r.notes}</div>}
                      {r.nextVisit&&<div style={{fontSize:12,color:T.brandMid,fontWeight:600,marginTop:10}}>🗓 Próxima visita: {fmtDate(r.nextVisit)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"0 36px 36px"}}>
      <PageTitle icon="🐾" title="Mascotas" sub={`${pets.length} mascotas registradas en MOGA`} action={<Btn v="accent" onClick={()=>setModal(true)}>+ Nueva mascota</Btn>}/>
      <div style={{position:"relative",marginBottom:20}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,color:T.textMuted}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre o raza..." className="moga-input"
          style={{padding:"11px 14px 11px 40px",border:`1.5px solid ${T.border}`,borderRadius:12,fontSize:14,color:T.text,background:T.panel,fontFamily:T.font,width:320,boxShadow:T.sm}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16}}>
        {filtered.map(pet=>{
          const owner=users.find(u=>u.id===pet.ownerId);
          const recs=records.filter(r=>r.petId===pet.id);
          const petVax=vaccines.filter(v=>v.petId===pet.id);
          const urgent=petVax.filter(v=>vaxStatus(v.nextDue).key!=="green");
          return(
            <div key={pet.id} className="hover-lift" onClick={()=>setSelected(pet)} style={{background:T.panel,borderRadius:16,boxShadow:T.sm,border:`1px solid ${T.border}`,overflow:"hidden",cursor:"pointer"}}>
              <div style={{background:`linear-gradient(135deg,${T.brand},${T.brandMid})`,padding:"20px",textAlign:"center",position:"relative"}}>
                {urgent.length>0&&<div style={{position:"absolute",top:10,right:10,background:"#dc2626",color:"#fff",borderRadius:8,fontSize:11,fontWeight:700,padding:"2px 7px"}}>⚠ {urgent.length}</div>}
                <div style={{fontSize:48}}>{spIcon(pet.species)}</div>
              </div>
              <div style={{padding:"14px 16px"}}>
                <div style={{fontSize:17,fontWeight:800,color:T.text,fontFamily:T.font,marginBottom:2}}>{pet.name}</div>
                <div style={{fontSize:13,color:T.textMuted}}>{pet.breed}</div>
                <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>{pet.age}a · {pet.weight}kg · {pet.gender}</div>
                {owner&&<div style={{fontSize:12,color:T.textMuted,marginTop:8,paddingTop:8,borderTop:`1px solid ${T.border}`}}>👤 {owner.name}</div>}
                <div style={{fontSize:12,color:T.gold,fontWeight:700,marginTop:6}}>📋 {recs.length} ficha{recs.length!==1?"s":""} →</div>
              </div>
            </div>
          );
        })}
      </div>
      {modal&&<Modal title="Registrar nueva mascota" onClose={()=>setModal(false)}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <Input label="Nombre *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Luna"/>
          <Select label="Especie" value={form.species} onChange={e=>setForm({...form,species:e.target.value})}>{["Perro","Gato","Conejo","Ave","Otro"].map(s=><option key={s}>{s}</option>)}</Select>
          <Input label="Raza" value={form.breed} onChange={e=>setForm({...form,breed:e.target.value})} placeholder="Labrador Dorado"/>
          <Select label="Género" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option>Hembra</option><option>Macho</option></Select>
          <Input label="Edad (años)" type="number" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} placeholder="3"/>
          <Input label="Peso (kg)" type="number" step="0.1" value={form.weight} onChange={e=>setForm({...form,weight:e.target.value})} placeholder="25.5"/>
          <Input label="Color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})} placeholder="Dorado"/>
          <Input label="Microchip" value={form.chip} onChange={e=>setForm({...form,chip:e.target.value})} placeholder="985141..."/>
        </div>
        <Select label="Propietario *" value={form.ownerId} onChange={e=>setForm({...form,ownerId:e.target.value})}>
          <option value="">Seleccionar cliente...</option>
          {clients.map(c=><option key={c.id} value={c.id}>{c.name} — {c.rut}</option>)}
        </Select>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn v="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="accent" onClick={save}>Guardar mascota</Btn></div>
      </Modal>}
    </div>
  );
}

// ─── RECORDS ─────────────────────────────────────────────────
function RecordsTab({ records, pets, users, onAddRecord }) {
  const [search,setSearch]=useState(""); const [petFilter,setPetFilter]=useState(""); const [modal,setModal]=useState(false);
  const today=TODAY.toISOString().slice(0,10);
  const [form,setForm]=useState({petId:"",date:today,vet:"",type:"Control",diagnosis:"",treatment:"",weight:"",temperature:"",notes:"",nextVisit:""});
  const vets=users.filter(u=>u.role!=="client");
  const filtered=records.filter(r=>{const pet=pets.find(p=>p.id===r.petId);const q=search.toLowerCase();return(!q||pet?.name.toLowerCase().includes(q)||r.diagnosis.toLowerCase().includes(q))&&(!petFilter||r.petId===+petFilter);}).sort((a,b)=>b.date.localeCompare(a.date));
  const save=()=>{if(!form.petId||!form.diagnosis)return;onAddRecord({...form,petId:+form.petId,weight:+form.weight});setModal(false);setForm({petId:"",date:today,vet:"",type:"Control",diagnosis:"",treatment:"",weight:"",temperature:"",notes:"",nextVisit:""});};

  return (
    <div style={{padding:"0 36px 36px"}}>
      <PageTitle icon="📋" title="Fichas médicas" sub={`${records.length} registros clínicos`} action={<Btn v="accent" onClick={()=>setModal(true)}>+ Nueva ficha</Btn>}/>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:T.textMuted}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="moga-input" style={{padding:"10px 14px 10px 36px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,color:T.text,background:T.panel,fontFamily:T.font,width:240}}/>
        </div>
        <select value={petFilter} onChange={e=>setPetFilter(e.target.value)} className="moga-input" style={{padding:"10px 14px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,color:T.text,background:T.panel,fontFamily:T.font}}>
          <option value="">Todas las mascotas</option>
          {pets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <TableWrap heads={["Mascota","Fecha","Tipo","Diagnóstico","Peso","Temperatura","Veterinario/a","Próx. visita"]} empty={filtered.length===0?"Sin registros encontrados.":undefined}>
        {filtered.map(r=>{const pet=pets.find(p=>p.id===r.petId);return(
          <TR key={r.id}>
            <TD bold><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:32,height:32,borderRadius:8,background:T.brandLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{spIcon(pet?.species)}</div>{pet?.name}</div></TD>
            <TD>{fmtDate(r.date)}</TD>
            <TD><TypeBadge type={r.type}/></TD>
            <TD><div style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:T.textMid}}>{r.diagnosis}</div></TD>
            <TD>{r.weight}kg</TD>
            <TD>{r.temperature}°C</TD>
            <TD muted>{r.vet.replace("Dra. ","").replace("Dr. ","")}</TD>
            <TD>{r.nextVisit?<span style={{color:T.brandMid,fontWeight:600,fontSize:13}}>{fmtDate(r.nextVisit)}</span>:<span style={{color:T.textMuted}}>—</span>}</TD>
          </TR>
        );})}
      </TableWrap>
      {modal&&<Modal title="Nueva ficha médica" onClose={()=>setModal(false)}>
        <Select label="Mascota *" value={form.petId} onChange={e=>setForm({...form,petId:e.target.value})}><option value="">Seleccionar...</option>{pets.map(p=><option key={p.id} value={p.id}>{p.name} ({p.breed})</option>)}</Select>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <Input label="Fecha *" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
          <Select label="Tipo" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{["Control","Urgencia","Cirugía","Vacunación"].map(t=><option key={t}>{t}</option>)}</Select>
          <Input label="Peso (kg)" type="number" step="0.1" value={form.weight} onChange={e=>setForm({...form,weight:e.target.value})} placeholder="25.5"/>
          <Input label="Temperatura (°C)" value={form.temperature} onChange={e=>setForm({...form,temperature:e.target.value})} placeholder="38.5"/>
        </div>
        <Select label="Veterinario/a" value={form.vet} onChange={e=>setForm({...form,vet:e.target.value})}><option value="">Seleccionar...</option>{vets.map(v=><option key={v.id}>{v.name}</option>)}</Select>
        <Input label="Diagnóstico *" value={form.diagnosis} onChange={e=>setForm({...form,diagnosis:e.target.value})} placeholder="Ej: Control rutinario. Animal sano."/>
        <Input label="Tratamiento" value={form.treatment} onChange={e=>setForm({...form,treatment:e.target.value})} placeholder="Ej: Vacuna antirrábica"/>
        <Input label="Notas" textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Observaciones adicionales..."/>
        <Input label="Próxima visita" type="date" value={form.nextVisit} onChange={e=>setForm({...form,nextVisit:e.target.value})}/>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn v="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="accent" onClick={save}>Guardar ficha</Btn></div>
      </Modal>}
    </div>
  );
}

// ─── GROOMING ────────────────────────────────────────────────
function GroomingTab({ grooming, pets, users, onAddGrooming, onUpdateStatus }) {
  const [view,setView]=useState("calendar"); const [filter,setFilter]=useState("todas"); const [modal,setModal]=useState(false);
  const [calYear,setCalYear]=useState(2026); const [calMonth,setCalMonth]=useState(3);
  const [form,setForm]=useState({petId:"",clientId:"",date:"",time:"09:00",service:SERVICES[0],notes:"",price:18000,status:"pendiente"});
  const clients=users.filter(u=>u.role==="client");
  const display=(filter==="todas"?grooming:grooming.filter(g=>g.status===filter)).sort((a,b)=>a.date.localeCompare(b.date));
  const save=()=>{if(!form.petId||!form.clientId||!form.date)return;onAddGrooming({...form,petId:+form.petId,clientId:+form.clientId,price:+form.price});setModal(false);setForm({petId:"",clientId:"",date:"",time:"09:00",service:SERVICES[0],notes:"",price:18000,status:"pendiente"});};
  const days=calDays(calYear,calMonth);
  const getAppts=day=>{const ds=`${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;return grooming.filter(g=>g.date===ds);};
  const todayD=TODAY.getFullYear()===calYear&&TODAY.getMonth()===calMonth?TODAY.getDate():null;
  const stColors={confirmada:"#22c55e",pendiente:"#f59e0b",completada:"#94a3b8",cancelada:"#ef4444"};

  return (
    <div style={{padding:"0 36px 36px"}}>
      <PageTitle icon="✂️" title="Peluquería" sub="Agenda y gestión de citas" action={
        <div style={{display:"flex",gap:10}}>
          <div style={{display:"flex",border:`1.5px solid ${T.border}`,borderRadius:10,overflow:"hidden",background:T.panel,boxShadow:T.sm}}>
            {[["calendar","📅 Calendario"],["lista","☰ Lista"]].map(([id,lbl])=>(
              <button key={id} onClick={()=>setView(id)} style={{padding:"9px 18px",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:T.font,background:view===id?T.brand:"transparent",color:view===id?"#fff":T.textMuted,transition:"all 0.15s"}}>{lbl}</button>
            ))}
          </div>
          <Btn v="accent" onClick={()=>setModal(true)}>+ Agendar</Btn>
        </div>
      }/>

      {view==="calendar"&&(
        <div style={{background:T.panel,borderRadius:16,boxShadow:T.md,border:`1px solid ${T.border}`,overflow:"hidden"}}>
          <div style={{padding:"18px 24px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <button onClick={()=>{const d=new Date(calYear,calMonth-1,1);setCalYear(d.getFullYear());setCalMonth(d.getMonth());}} style={{background:T.appBg,border:`1px solid ${T.border}`,padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:T.font}}>←</button>
            <div style={{fontSize:18,fontWeight:800,color:T.text,fontFamily:T.font}}>{MONTHS[calMonth]} {calYear}</div>
            <button onClick={()=>{const d=new Date(calYear,calMonth+1,1);setCalYear(d.getFullYear());setCalMonth(d.getMonth());}} style={{background:T.appBg,border:`1px solid ${T.border}`,padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:T.font}}>→</button>
          </div>
          <div style={{padding:"16px 20px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
              {DAYS_S.map(d=><div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:T.textMuted,padding:"6px 0",letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:T.font}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
              {days.map((day,i)=>{
                if(!day) return <div key={`e${i}`}/>;
                const appts=getAppts(day); const isT=day===todayD;
                return(
                  <div key={day} style={{borderRadius:10,padding:"8px 7px",minHeight:86,background:isT?`${T.brand}10`:T.appBg,border:isT?`2px solid ${T.brand}`:`1px solid ${T.border}`,transition:"background 0.15s"}}>
                    <div style={{fontSize:13,fontWeight:isT?800:500,color:isT?"#fff":T.text,background:isT?T.brand:"transparent",width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:4,fontFamily:T.font}}>{day}</div>
                    {appts.map(a=>{const pet=pets.find(p=>p.id===a.petId);const col=stColors[a.status]||"#94a3b8";return(
                      <div key={a.id} title={`${pet?.name} — ${a.service}`} style={{fontSize:10,background:`${col}18`,borderLeft:`3px solid ${col}`,borderRadius:"0 5px 5px 0",padding:"2px 5px",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:600,color:col,fontFamily:T.font}}>
                        {a.time} {pet?.name}
                      </div>
                    );})}
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:14,marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
              {[["confirmada","#22c55e"],["pendiente","#f59e0b"],["completada","#94a3b8"],["cancelada","#ef4444"]].map(([s,col])=>(
                <div key={s} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontFamily:T.font}}>
                  <div style={{width:3,height:14,borderRadius:2,background:col}}/><span style={{color:T.textMuted,textTransform:"capitalize"}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view==="lista"&&(<>
        <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
          {["todas","pendiente","confirmada","completada","cancelada"].map(f=>(
            <button key={f} className={`chip-select ${filter===f?"active":""}`} onClick={()=>setFilter(f)} style={{padding:"7px 18px",borderRadius:20,border:`1.5px solid ${T.border}`,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:T.font,background:filter===f?T.brand:T.panel,color:filter===f?"#fff":T.textMuted}}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
        <div style={{display:"grid",gap:12}}>
          {display.map(g=>{const pet=pets.find(p=>p.id===g.petId),client=users.find(u=>u.id===g.clientId);return(
            <div key={g.id} style={{background:T.panel,borderRadius:14,boxShadow:T.sm,border:`1px solid ${T.border}`,padding:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
              <div style={{display:"flex",alignItems:"center",gap:14,flex:1}}>
                <div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${T.brand},${T.brandMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>
                  {spIcon(pet?.species)}
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:T.text,fontFamily:T.font}}>{pet?.name} <span style={{fontWeight:400,color:T.textMuted,fontSize:14}}>· {client?.name}</span></div>
                  <div style={{fontSize:13,color:T.textMuted,marginTop:2}}>{g.service}</div>
                  {g.notes&&<div style={{fontSize:12,color:T.textMuted,fontStyle:"italic",marginTop:3}}>📝 {g.notes}</div>}
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:6,fontFamily:T.font}}>📅 {fmtDate(g.date)} · {g.time}</div>
                <div style={{marginBottom:8}}><StatusBadge status={g.status}/></div>
                <div style={{fontSize:15,fontWeight:800,color:T.brand,marginBottom:10,fontFamily:T.font}}>{fmtCLP(g.price)}</div>
                <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                  {g.status==="pendiente"&&<><Btn v="sm_green" onClick={()=>onUpdateStatus(g.id,"confirmada")}>✓ Confirmar</Btn><Btn v="sm_red" onClick={()=>onUpdateStatus(g.id,"cancelada")}>✗</Btn></>}
                  {g.status==="confirmada"&&<Btn v="sm_gray" onClick={()=>onUpdateStatus(g.id,"completada")}>✓ Completar</Btn>}
                </div>
              </div>
            </div>
          );})}
          {display.length===0&&<div style={{textAlign:"center",padding:48,color:T.textMuted,fontSize:14,background:T.panel,borderRadius:14}}>Sin citas en esta categoría.</div>}
        </div>
      </>)}

      {modal&&<Modal title="Agendar cita de peluquería" onClose={()=>setModal(false)}>
        <Select label="Cliente *" value={form.clientId} onChange={e=>setForm({...form,clientId:e.target.value,petId:""})}><option value="">Seleccionar cliente...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name} — {c.rut}</option>)}</Select>
        <Select label="Mascota *" value={form.petId} onChange={e=>setForm({...form,petId:e.target.value})}><option value="">Seleccionar mascota...</option>{pets.filter(p=>!form.clientId||p.ownerId===+form.clientId).map(p=><option key={p.id} value={p.id}>{p.name} ({p.breed})</option>)}</Select>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <Input label="Fecha *" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
          <Input label="Hora" type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/>
        </div>
        <Select label="Servicio" value={form.service} onChange={e=>setForm({...form,service:e.target.value})}>{SERVICES.map(s=><option key={s}>{s}</option>)}</Select>
        <Input label="Precio (CLP)" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
        <Input label="Notas especiales" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Instrucciones especiales..."/>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn v="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="accent" onClick={save}>Agendar cita</Btn></div>
      </Modal>}
    </div>
  );
}

// ─── VACCINES ─────────────────────────────────────────────────
function VaccinesTab({ vaccines, pets, users, onAddVaccine }) {
  const [petFilter,setPetFilter]=useState(""); const [modal,setModal]=useState(false);
  const today=TODAY.toISOString().slice(0,10);
  const [form,setForm]=useState({petId:"",name:"",dateApplied:today,nextDue:"",vet:"",lot:""});
  const vets=users.filter(u=>u.role!=="client");
  const overdue=vaccines.filter(v=>vaxStatus(v.nextDue).key==="red");
  const upcoming=vaccines.filter(v=>vaxStatus(v.nextDue).key==="amber");
  const filtered=(petFilter?vaccines.filter(v=>v.petId===+petFilter):vaccines).sort((a,b)=>vaxStatus(a.nextDue).key==="red"?-1:vaxStatus(a.nextDue).key==="amber"?0:1);
  const save=()=>{if(!form.petId||!form.name||!form.nextDue)return;onAddVaccine({...form,petId:+form.petId});setModal(false);setForm({petId:"",name:"",dateApplied:today,nextDue:"",vet:"",lot:""});};

  return (
    <div style={{padding:"0 36px 36px"}}>
      <PageTitle icon="💉" title="Vacunas & Recordatorios" sub={`${vaccines.length} registros · ${overdue.length} vencidas · ${upcoming.length} próximas`} action={<Btn v="accent" onClick={()=>setModal(true)}>+ Registrar vacuna</Btn>}/>
      {(overdue.length>0||upcoming.length>0)&&(
        <div style={{display:"grid",gridTemplateColumns:overdue.length&&upcoming.length?"1fr 1fr":"1fr",gap:14,marginBottom:22}}>
          {overdue.length>0&&(
            <div style={{borderRadius:14,overflow:"hidden",border:`1px solid #fca5a5`,boxShadow:T.sm}}>
              <div style={{background:`linear-gradient(135deg,#7f1d1d,#dc2626)`,padding:"14px 20px"}}>
                <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>🚨 Vacunas vencidas — {overdue.length}</div>
              </div>
              <div style={{background:"#fff"}}>
                {overdue.map(v=>{const pet=pets.find(p=>p.id===v.petId);const st=vaxStatus(v.nextDue);return(
                  <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 20px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontFamily:T.font}}>
                    <div><span style={{fontWeight:700,color:T.text}}>{spIcon(pet?.species)} {pet?.name}</span> — {v.name}</div>
                    <span style={{color:T.redText,fontWeight:600,fontSize:12}}>{st.label}</span>
                  </div>
                );})}
              </div>
            </div>
          )}
          {upcoming.length>0&&(
            <div style={{borderRadius:14,overflow:"hidden",border:`1px solid #fcd34d`,boxShadow:T.sm}}>
              <div style={{background:`linear-gradient(135deg,#78350f,#d97706)`,padding:"14px 20px"}}>
                <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>⏰ Próximas a vencer — {upcoming.length}</div>
              </div>
              <div style={{background:"#fff"}}>
                {upcoming.map(v=>{const pet=pets.find(p=>p.id===v.petId);const st=vaxStatus(v.nextDue);return(
                  <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 20px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontFamily:T.font}}>
                    <div><span style={{fontWeight:700,color:T.text}}>{spIcon(pet?.species)} {pet?.name}</span> — {v.name}</div>
                    <span style={{color:T.amberText,fontWeight:600,fontSize:12}}>{st.label}</span>
                  </div>
                );})}
              </div>
            </div>
          )}
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
        <span style={{fontSize:14,color:T.textMuted,fontFamily:T.font}}>Filtrar:</span>
        <select value={petFilter} onChange={e=>setPetFilter(e.target.value)} className="moga-input" style={{padding:"8px 12px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,color:T.text,background:T.panel,fontFamily:T.font}}>
          <option value="">Todas las mascotas</option>
          {pets.map(p=><option key={p.id} value={p.id}>{spIcon(p.species)} {p.name}</option>)}
        </select>
      </div>
      <TableWrap heads={["Mascota","Vacuna","Aplicada","Próxima dosis","Veterinario/a","Lote","Estado"]} empty={filtered.length===0?"Sin registros.":undefined}>
        {filtered.map(v=>{const pet=pets.find(p=>p.id===v.petId);return(
          <TR key={v.id}>
            <TD bold><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:30,height:30,borderRadius:8,background:T.brandLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{spIcon(pet?.species)}</div>{pet?.name}</div></TD>
            <TD bold>{v.name}</TD>
            <TD>{fmtDate(v.dateApplied)}</TD>
            <TD><span style={{fontWeight:600,color:vaxStatus(v.nextDue).key==="red"?T.redText:vaxStatus(v.nextDue).key==="amber"?T.amberText:T.text}}>{fmtDate(v.nextDue)}</span></TD>
            <TD muted>{v.vet}</TD>
            <TD><span style={{fontFamily:"monospace",fontSize:12,color:T.textMuted}}>{v.lot}</span></TD>
            <TD><VaxBadge nextDue={v.nextDue}/></TD>
          </TR>
        );})}
      </TableWrap>
      {modal&&<Modal title="Registrar vacuna" onClose={()=>setModal(false)}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <Select label="Mascota *" value={form.petId} onChange={e=>setForm({...form,petId:e.target.value})}><option value="">Seleccionar...</option>{pets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          <Select label="Vacuna *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}><option value="">Seleccionar...</option>{VACCINES_LIST.map(v=><option key={v}>{v}</option>)}</Select>
          <Input label="Fecha aplicación *" type="date" value={form.dateApplied} onChange={e=>setForm({...form,dateApplied:e.target.value})}/>
          <Input label="Próxima dosis *" type="date" value={form.nextDue} onChange={e=>setForm({...form,nextDue:e.target.value})}/>
        </div>
        <Select label="Veterinario/a" value={form.vet} onChange={e=>setForm({...form,vet:e.target.value})}><option value="">Seleccionar...</option>{vets.map(v=><option key={v.id}>{v.name}</option>)}</Select>
        <Input label="N° de lote" value={form.lot} onChange={e=>setForm({...form,lot:e.target.value})} placeholder="VR2026-XXX"/>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn v="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="accent" onClick={save}>Registrar</Btn></div>
      </Modal>}
    </div>
  );
}

// ─── PAYMENTS ────────────────────────────────────────────────
function PaymentsTab({ payments, pets, users, onAddPayment, onMarkPaid }) {
  const [catF,setCatF]=useState(""); const [stF,setStF]=useState(""); const [modal,setModal]=useState(false);
  const today=TODAY.toISOString().slice(0,10);
  const [form,setForm]=useState({concept:"",petId:"",clientId:"",date:today,amount:"",category:"Consulta",status:"pendiente",method:""});
  const clients=users.filter(u=>u.role==="client");
  const filtered=payments.filter(p=>(!catF||p.category===catF)&&(!stF||p.status===stF)).sort((a,b)=>b.date.localeCompare(a.date));
  const totalPaid=payments.filter(p=>p.status==="pagado").reduce((s,p)=>s+p.amount,0);
  const totalPend=payments.filter(p=>p.status==="pendiente").reduce((s,p)=>s+p.amount,0);
  const total=payments.reduce((s,p)=>s+p.amount,0);
  const save=()=>{if(!form.concept||!form.amount)return;onAddPayment({...form,petId:+form.petId||null,clientId:+form.clientId||null,amount:+form.amount});setModal(false);setForm({concept:"",petId:"",clientId:"",date:today,amount:"",category:"Consulta",status:"pendiente",method:""});};
  const selRefs = useRef({});

  return (
    <div style={{padding:"0 36px 36px"}}>
      <PageTitle icon="💳" title="Historial de pagos" sub={`${payments.length} transacciones registradas`} action={<Btn v="accent" onClick={()=>setModal(true)}>+ Registrar pago</Btn>}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
        <KpiCard label="Total facturado" value={fmtCLP(total)} icon="🧾" gradient={`linear-gradient(135deg, #1e3a5f, #2563eb)`} delay="2"/>
        <KpiCard label="Ingresos recibidos" value={fmtCLP(totalPaid)} icon="✅" gradient={`linear-gradient(135deg, ${T.brand}, ${T.brandMid})`} delay="3"/>
        <KpiCard label="Pendiente de cobro" value={fmtCLP(totalPend)} icon="⏳" gradient={`linear-gradient(135deg, #78350f, ${T.gold})`} delay="4"/>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:18}}>
        <select value={catF} onChange={e=>setCatF(e.target.value)} className="moga-input" style={{padding:"9px 12px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,color:T.text,background:T.panel,fontFamily:T.font}}>
          <option value="">Todas las categorías</option>{PAY_CATS.map(c=><option key={c}>{c}</option>)}
        </select>
        <select value={stF} onChange={e=>setStF(e.target.value)} className="moga-input" style={{padding:"9px 12px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,color:T.text,background:T.panel,fontFamily:T.font}}>
          <option value="">Todos los estados</option><option value="pagado">Pagado</option><option value="pendiente">Pendiente</option>
        </select>
      </div>
      <TableWrap heads={["Concepto","Mascota","Cliente","Categoría","Fecha","Monto","Método","Estado",""]} empty={filtered.length===0?"Sin resultados.":undefined}>
        {filtered.map(p=>{const pet=pets.find(pt=>pt.id===p.petId);const client=users.find(u=>u.id===p.clientId);return(
          <TR key={p.id}>
            <TD bold><div style={{maxWidth:190,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.concept}</div></TD>
            <TD>{pet?`${spIcon(pet.species)} ${pet.name}`:"—"}</TD>
            <TD muted>{client?.name||"—"}</TD>
            <TD><CatBadge cat={p.category}/></TD>
            <TD>{fmtDate(p.date)}</TD>
            <TD><span style={{fontWeight:700,color:p.status==="pagado"?T.greenText:T.amberText}}>{fmtCLP(p.amount)}</span></TD>
            <TD muted>{p.method||"—"}</TD>
            <TD><span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:p.status==="pagado"?T.green:T.amber,color:p.status==="pagado"?T.greenText:T.amberText,fontSize:12,fontWeight:600}}><Dot color={p.status==="pagado"?"#22c55e":"#f59e0b"}/>{p.status==="pagado"?"Pagado":"Pendiente"}</span></TD>
            <TD>
              {p.status==="pendiente"&&(
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <select ref={el=>selRefs.current[p.id]=el} style={{padding:"4px 8px",border:`1px solid ${T.border}`,borderRadius:6,fontSize:12,fontFamily:T.font,outline:"none"}}>
                    {PAY_METHODS.map(m=><option key={m}>{m}</option>)}
                  </select>
                  <Btn v="sm_green" onClick={()=>onMarkPaid(p.id,selRefs.current[p.id]?.value||"Efectivo")}>✓ Cobrar</Btn>
                </div>
              )}
            </TD>
          </TR>
        );})}
      </TableWrap>
      {modal&&<Modal title="Registrar pago" onClose={()=>setModal(false)}>
        <Input label="Concepto *" value={form.concept} onChange={e=>setForm({...form,concept:e.target.value})} placeholder="Ej: Consulta veterinaria Luna"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <Select label="Cliente" value={form.clientId} onChange={e=>setForm({...form,clientId:e.target.value,petId:""})}><option value="">Seleccionar...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select>
          <Select label="Mascota" value={form.petId} onChange={e=>setForm({...form,petId:e.target.value})}><option value="">Seleccionar...</option>{pets.filter(p=>!form.clientId||p.ownerId===+form.clientId).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          <Select label="Categoría" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{PAY_CATS.map(c=><option key={c}>{c}</option>)}</Select>
          <Input label="Fecha" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
          <Input label="Monto (CLP) *" type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="25000"/>
          <Select label="Estado" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="pendiente">Pendiente</option><option value="pagado">Pagado</option></Select>
        </div>
        {form.status==="pagado"&&<Select label="Método de pago" value={form.method} onChange={e=>setForm({...form,method:e.target.value})}><option value="">Seleccionar...</option>{PAY_METHODS.map(m=><option key={m}>{m}</option>)}</Select>}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn v="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="accent" onClick={save}>Registrar pago</Btn></div>
      </Modal>}
    </div>
  );
}

// ─── USERS ───────────────────────────────────────────────────
function UsersTab({ users, pets, onAddUser }) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({name:"",email:"",rut:"",phone:"",password:"cliente123"});
  const clients=users.filter(u=>u.role==="client"); const staff=users.filter(u=>u.role!=="client");
  const save=()=>{if(!form.name||!form.email||!form.rut)return;onAddUser(form);setModal(false);setForm({name:"",email:"",rut:"",phone:"",password:"cliente123"});};

  return (
    <div style={{padding:"0 36px 36px"}}>
      <PageTitle icon="👥" title="Clientes & Personal" sub={`${clients.length} clientes · ${staff.length} personal`} action={<Btn v="accent" onClick={()=>setModal(true)}>+ Nuevo cliente</Btn>}/>
      <div style={{marginBottom:24}}>
        <Label>Personal MOGA</Label>
        <div style={{display:"flex",gap:14,marginTop:10}}>
          {staff.map(u=>(
            <div key={u.id} style={{background:T.panel,borderRadius:14,boxShadow:T.sm,border:`1px solid ${T.border}`,padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
              <Avatar name={u.name} size={46} bg={T.brand}/>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:T.text,fontFamily:T.font}}>{u.name}</div>
                <div style={{fontSize:12,color:T.textMuted,textTransform:"capitalize",marginTop:2}}>{u.role==="admin"?"Administrador":"Veterinario/a"}</div>
                <div style={{fontSize:12,color:T.textMuted,marginTop:1}}>{u.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{marginBottom:12}}><Label>Clientes registrados</Label></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
        {clients.map(c=>{const myPets=pets.filter(p=>p.ownerId===c.id);return(
          <div key={c.id} className="hover-lift" style={{background:T.panel,borderRadius:14,boxShadow:T.sm,border:`1px solid ${T.border}`,overflow:"hidden"}}>
            <div style={{background:`linear-gradient(135deg,${T.brand},${T.brandMid})`,padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
              <Avatar name={c.name} size={44} bg="rgba(255,255,255,0.2)"/>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:"#fff",fontFamily:T.font}}>{c.name}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.65)",marginTop:2}}>RUT: {c.rut}</div>
              </div>
            </div>
            <div style={{padding:"14px 20px"}}>
              <div style={{fontSize:13,color:T.textMuted,marginBottom:4,fontFamily:T.font}}>📧 {c.email}</div>
              <div style={{fontSize:13,color:T.textMuted,marginBottom:12}}>📱 {c.phone}</div>
              <div style={{paddingTop:10,borderTop:`1px solid ${T.border}`,fontSize:13,display:"flex",gap:8,flexWrap:"wrap"}}>
                {myPets.length>0?myPets.map(p=>(
                  <span key={p.id} style={{display:"inline-flex",alignItems:"center",gap:4,background:T.brandLight,color:T.brand,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600}}>{spIcon(p.species)} {p.name}</span>
                )):<span style={{color:T.textMuted,fontSize:12}}>Sin mascotas registradas</span>}
              </div>
            </div>
          </div>
        );})}
      </div>
      {modal&&<Modal title="Registrar nuevo cliente" onClose={()=>setModal(false)}>
        <Input label="Nombre completo *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="María Torres"/>
        <Input label="RUT *" value={form.rut} onChange={e=>setForm({...form,rut:e.target.value})} placeholder="12.345.678-9"/>
        <Input label="Correo electrónico *" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="cliente@email.cl"/>
        <Input label="Teléfono" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+56 9 1234 5678"/>
        <Input label="Contraseña inicial" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn v="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="accent" onClick={save}>Registrar cliente</Btn></div>
      </Modal>}
    </div>
  );
}

// ─── ADMIN SHELL ─────────────────────────────────────────────
function AdminDashboard({ user, users, pets, records, grooming, vaccines, payments, onLogout, onAddPet, onAddRecord, onAddGrooming, onUpdateGroomingStatus, onAddUser, onAddVaccine, onAddPayment, onMarkPaid }) {
  useGlobalStyle();
  const [tab,setTab]=useState("overview");
  const urgentVax=vaccines.filter(v=>vaxStatus(v.nextDue).key!=="green").length;
  const pendingPay=payments.filter(p=>p.status==="pendiente").length;

  return (
    <div style={{display:"flex",minHeight:"100vh",background:T.appBg,fontFamily:T.font}}>
      <Sidebar user={user} activeTab={tab} onTab={setTab} onLogout={onLogout} badges={{vaccines:urgentVax,payments:pendingPay}}/>
      <div style={{flex:1,overflow:"auto"}}>
        {tab==="overview"&&<OverviewTab pets={pets} records={records} grooming={grooming} users={users} payments={payments} vaccines={vaccines}/>}
        {tab==="pets"&&<PetsTab pets={pets} users={users} records={records} vaccines={vaccines} onAddPet={onAddPet}/>}
        {tab==="records"&&<RecordsTab records={records} pets={pets} users={users} onAddRecord={onAddRecord}/>}
        {tab==="grooming"&&<GroomingTab grooming={grooming} pets={pets} users={users} onAddGrooming={onAddGrooming} onUpdateStatus={onUpdateGroomingStatus}/>}
        {tab==="vaccines"&&<VaccinesTab vaccines={vaccines} pets={pets} users={users} onAddVaccine={onAddVaccine}/>}
        {tab==="payments"&&<PaymentsTab payments={payments} pets={pets} users={users} onAddPayment={onAddPayment} onMarkPaid={onMarkPaid}/>}
        {tab==="users"&&<UsersTab users={users} pets={pets} onAddUser={onAddUser}/>}
      </div>
    </div>
  );
}

// ─── CLIENT PORTAL ───────────────────────────────────────────
function ClientPortal({ user, pets, records, grooming, vaccines, payments, onLogout, onBookGrooming }) {
  useGlobalStyle();
  const [tab,setTab]=useState("pets"); const [selPet,setSelPet]=useState(null);
  const [bookModal,setBookModal]=useState(false); const [booked,setBooked]=useState(false);
  const [form,setForm]=useState({petId:pets[0]?.id||"",date:"",time:"10:00",service:SERVICES[0],notes:""});
  const myVaxAlert=vaccines.filter(v=>vaxStatus(v.nextDue).key!=="green");
  const myPayPend=payments.filter(p=>p.status==="pendiente");

  const book=()=>{if(!form.petId||!form.date)return;onBookGrooming({...form,petId:+form.petId,status:"pendiente",price:15000});setBooked(true);setTimeout(()=>{setBooked(false);setBookModal(false);},2500);};

  return (
    <div style={{minHeight:"100vh",background:T.appBg,fontFamily:T.font}}>
      {/* Header */}
      <div style={{background:T.sb,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 36px",height:64,boxShadow:"0 2px 20px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#1d6b3f,#2d9a5c)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🐾</div>
          <div style={{fontFamily:T.fontDisplay,fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"0.04em"}}>MOGA</div>
          <div style={{width:1,height:18,background:"rgba(255,255,255,0.15)",margin:"0 8px"}}/>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.45)",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600}}>Portal Cliente</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Avatar name={user.name} size={34} bg={T.gold}/>
          <span style={{color:"rgba(255,255,255,0.75)",fontSize:14,fontWeight:500}}>{user.name.split(" ")[0]}</span>
          <Btn v="ghost" style={{color:"rgba(255,255,255,0.6)",borderColor:"rgba(255,255,255,0.15)",padding:"7px 14px",fontSize:13}} onClick={onLogout}>Salir</Btn>
        </div>
      </div>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"28px 24px 56px"}}>
        {/* Welcome card */}
        <div style={{background:`linear-gradient(135deg,${T.brand},${T.brandMid})`,borderRadius:20,padding:"24px 32px",marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:T.lg}}>
          <div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",fontWeight:600,marginBottom:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>Bienvenido/a de regreso</div>
            <div style={{fontSize:26,fontWeight:900,color:"#fff",fontFamily:T.font,lineHeight:1}}>{user.name}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginTop:6}}>RUT: {user.rut} · {user.phone}</div>
          </div>
          <Btn v="accent" onClick={()=>setBookModal(true)}>✂️ Agendar peluquería</Btn>
        </div>

        {/* Alerts */}
        {myVaxAlert.length>0&&<div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:14,padding:"14px 20px",marginBottom:12,display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:20}}>💉</span>
          <div style={{fontSize:13,color:T.amberText,fontFamily:T.font}}>
            <strong>{myVaxAlert.length} vacuna{myVaxAlert.length!==1?"s":""}</strong> de tus mascotas requieren atención. Contáctanos para agendar.
          </div>
        </div>}
        {myPayPend.length>0&&<div style={{background:"#eff6ff",border:"1px solid #93c5fd",borderRadius:14,padding:"14px 20px",marginBottom:12,display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:20}}>💳</span>
          <div style={{fontSize:13,color:T.blueText,fontFamily:T.font}}>Tienes <strong>{fmtCLP(myPayPend.reduce((s,p)=>s+p.amount,0))}</strong> en pagos pendientes.</div>
        </div>}

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:24,background:T.panel,borderRadius:12,padding:4,boxShadow:T.sm,width:"fit-content"}}>
          {[["pets",`🐾 Mascotas`],["grooming","✂️ Citas"],["payments","💳 Pagos"],["vaccines","💉 Vacunas"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>{setTab(id);setSelPet(null);}} style={{padding:"9px 18px",border:"none",cursor:"pointer",fontSize:13,fontWeight:tab===id?700:500,borderRadius:9,fontFamily:T.font,background:tab===id?T.brand:"transparent",color:tab===id?"#fff":T.textMuted,transition:"all 0.15s"}}>{lbl}</button>
          ))}
        </div>

        {tab==="pets"&&!selPet&&(pets.length===0?
          <div style={{textAlign:"center",padding:60,color:T.textMuted,background:T.panel,borderRadius:16}}><div style={{fontSize:52,marginBottom:12}}>🐾</div><div>Aún no tienes mascotas registradas en MOGA.</div></div>:
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:14}}>
            {pets.map(pet=>{const recs=records.filter(r=>r.petId===pet.id);return(
              <div key={pet.id} className="hover-lift" onClick={()=>setSelPet(pet)} style={{background:T.panel,borderRadius:16,boxShadow:T.sm,border:`1px solid ${T.border}`,overflow:"hidden",cursor:"pointer"}}>
                <div style={{background:`linear-gradient(135deg,${T.brand},${T.brandMid})`,padding:"20px",textAlign:"center"}}><div style={{fontSize:48}}>{spIcon(pet.species)}</div></div>
                <div style={{padding:"14px 16px"}}>
                  <div style={{fontSize:17,fontWeight:800,color:T.text,fontFamily:T.font}}>{pet.name}</div>
                  <div style={{fontSize:13,color:T.textMuted}}>{pet.breed}</div>
                  <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>{pet.age}a · {pet.weight}kg</div>
                  <div style={{fontSize:12,color:T.gold,fontWeight:700,marginTop:8}}>📋 {recs.length} ficha{recs.length!==1?"s":""} →</div>
                </div>
              </div>
            );})}
          </div>
        )}

        {tab==="pets"&&selPet&&(
          <div>
            <button onClick={()=>setSelPet(null)} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:T.font,display:"flex",alignItems:"center",gap:6,marginBottom:18,padding:0}}>← Volver</button>
            <div style={{display:"grid",gridTemplateColumns:"250px 1fr",gap:18}}>
              <div style={{background:T.panel,borderRadius:16,boxShadow:T.md,overflow:"hidden"}}>
                <div style={{background:`linear-gradient(135deg,${T.brand},${T.brandMid})`,padding:"24px",textAlign:"center"}}>
                  <div style={{fontSize:56,marginBottom:6}}>{spIcon(selPet.species)}</div>
                  <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:T.font}}>{selPet.name}</div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.65)",marginTop:2}}>{selPet.breed}</div>
                </div>
                <div style={{padding:"16px 18px"}}>
                  {[["Especie",selPet.species],["Género",selPet.gender],["Edad",`${selPet.age} años`],["Peso",`${selPet.weight} kg`],["Color",selPet.color]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`,fontSize:13,fontFamily:T.font}}><span style={{color:T.textMuted}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>
                  ))}
                </div>
              </div>
              <div style={{background:T.panel,borderRadius:16,boxShadow:T.md,padding:"24px 28px"}}>
                <div style={{fontSize:18,fontWeight:800,color:T.text,fontFamily:T.font,marginBottom:20}}>📋 Historial médico</div>
                {records.filter(r=>r.petId===selPet.id).sort((a,b)=>b.date.localeCompare(a.date)).map((r,i,arr)=>(
                  <div key={r.id} style={{display:"flex",gap:16,marginBottom:i===arr.length-1?0:20,position:"relative"}}>
                    {arr.length>1&&i<arr.length-1&&<div style={{position:"absolute",left:18,top:38,bottom:-20,width:2,background:T.border}}/>}
                    <div style={{width:36,height:36,borderRadius:"50%",background:T.brandLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,zIndex:1}}>
                      {r.type==="Urgencia"?"🚨":r.type==="Cirugía"?"🔬":r.type==="Vacunación"?"💉":"📋"}
                    </div>
                    <div style={{flex:1,background:T.appBg,borderRadius:12,padding:"14px 16px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:800,fontFamily:T.font,fontSize:14}}>{fmtDate(r.date)}</span><TypeBadge type={r.type}/></div>
                      <div style={{fontSize:13,marginBottom:4}}><strong>Diagnóstico:</strong> {r.diagnosis}</div>
                      {r.treatment&&<div style={{fontSize:13,marginBottom:4}}><strong>Tratamiento:</strong> {r.treatment}</div>}
                      <div style={{fontSize:11,color:T.textMuted,marginTop:6}}>Dr/a: {r.vet} · {r.weight}kg · {r.temperature}°C</div>
                      {r.notes&&<div style={{fontSize:12,background:T.panel,padding:"8px 10px",borderRadius:8,marginTop:8,borderLeft:`3px solid ${T.brand}`,color:T.textMuted}}>📝 {r.notes}</div>}
                      {r.nextVisit&&<div style={{fontSize:12,color:T.brandMid,fontWeight:700,marginTop:8}}>🗓 Próxima: {fmtDate(r.nextVisit)}</div>}
                    </div>
                  </div>
                ))}
                {records.filter(r=>r.petId===selPet.id).length===0&&<div style={{color:T.textMuted,fontSize:14}}>Sin fichas médicas aún.</div>}
              </div>
            </div>
          </div>
        )}

        {tab==="grooming"&&(grooming.length===0?
          <div style={{textAlign:"center",padding:60,color:T.textMuted,background:T.panel,borderRadius:16}}>
            <div style={{fontSize:52,marginBottom:12}}>✂️</div><div>No tienes citas agendadas.</div>
            <Btn v="accent" style={{marginTop:18}} onClick={()=>setBookModal(true)}>Agendar mi primera cita</Btn>
          </div>:
          <div style={{display:"grid",gap:12}}>
            {[...grooming].sort((a,b)=>a.date.localeCompare(b.date)).map(g=>{const pet=pets.find(p=>p.id===g.petId);return(
              <div key={g.id} style={{background:T.panel,borderRadius:14,boxShadow:T.sm,border:`1px solid ${T.border}`,padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:14,alignItems:"center"}}>
                  <div style={{width:50,height:50,borderRadius:14,background:`linear-gradient(135deg,${T.brand},${T.brandMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{spIcon(pet?.species)}</div>
                  <div><div style={{fontSize:15,fontWeight:800,fontFamily:T.font,color:T.text}}>{pet?.name}</div><div style={{fontSize:13,color:T.textMuted,marginTop:2}}>{g.service}</div></div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:700,marginBottom:6,fontFamily:T.font}}>📅 {fmtDate(g.date)} · {g.time}</div>
                  <div style={{marginBottom:6}}><StatusBadge status={g.status}/></div>
                  <div style={{fontSize:15,fontWeight:800,color:T.brand}}>{fmtCLP(g.price)}</div>
                </div>
              </div>
            );})}
          </div>
        )}

        {tab==="payments"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
              <KpiCard label="Total facturado" value={fmtCLP(payments.reduce((s,p)=>s+p.amount,0))} icon="🧾" gradient="linear-gradient(135deg,#1e3a5f,#2563eb)" delay="2"/>
              <KpiCard label="Pagado" value={fmtCLP(payments.filter(p=>p.status==="pagado").reduce((s,p)=>s+p.amount,0))} icon="✅" gradient={`linear-gradient(135deg,${T.brand},${T.brandMid})`} delay="3"/>
              <KpiCard label="Pendiente" value={fmtCLP(payments.filter(p=>p.status==="pendiente").reduce((s,p)=>s+p.amount,0))} icon="⏳" gradient={`linear-gradient(135deg,#78350f,${T.gold})`} delay="4"/>
            </div>
            <TableWrap heads={["Concepto","Mascota","Fecha","Monto","Método","Estado"]}>
              {[...payments].sort((a,b)=>b.date.localeCompare(a.date)).map(p=>{const pet=pets.find(pt=>pt.id===p.petId);return(
                <TR key={p.id}>
                  <TD bold><div style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.concept}</div></TD>
                  <TD>{pet?`${spIcon(pet.species)} ${pet.name}`:"—"}</TD>
                  <TD>{fmtDate(p.date)}</TD>
                  <TD><span style={{fontWeight:700,color:p.status==="pagado"?T.greenText:T.amberText}}>{fmtCLP(p.amount)}</span></TD>
                  <TD muted>{p.method||"—"}</TD>
                  <TD><span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:p.status==="pagado"?T.green:T.amber,color:p.status==="pagado"?T.greenText:T.amberText,fontSize:12,fontWeight:600}}><Dot color={p.status==="pagado"?"#22c55e":"#f59e0b"}/>{p.status==="pagado"?"Pagado":"Pendiente"}</span></TD>
                </TR>
              );})}
            </TableWrap>
          </div>
        )}

        {tab==="vaccines"&&(
          <div>
            {myVaxAlert.length>0&&<div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:14,padding:"16px 20px",marginBottom:16}}>
              <div style={{fontWeight:700,color:T.amberText,marginBottom:8,fontFamily:T.font}}>💉 Vacunas que requieren atención</div>
              {myVaxAlert.map(v=>{const pet=pets.find(p=>p.id===v.petId);const st=vaxStatus(v.nextDue);return(
                <div key={v.id} style={{fontSize:13,color:T.amberText,padding:"5px 0",borderTop:`1px solid #fde68a`,fontFamily:T.font}}>{spIcon(pet?.species)} <strong>{pet?.name}</strong> — {v.name}: {st.label}</div>
              );})}
            </div>}
            <TableWrap heads={["Mascota","Vacuna","Aplicada","Próxima dosis","Estado"]}>
              {vaccines.map(v=>{const pet=pets.find(p=>p.id===v.petId);return(
                <TR key={v.id}>
                  <TD bold><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:7,background:T.brandLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{spIcon(pet?.species)}</div>{pet?.name}</div></TD>
                  <TD bold>{v.name}</TD>
                  <TD>{fmtDate(v.dateApplied)}</TD>
                  <TD><span style={{fontWeight:600,color:vaxStatus(v.nextDue).key==="red"?T.redText:vaxStatus(v.nextDue).key==="amber"?T.amberText:T.text}}>{fmtDate(v.nextDue)}</span></TD>
                  <TD><VaxBadge nextDue={v.nextDue}/></TD>
                </TR>
              );})}
            </TableWrap>
          </div>
        )}
      </div>

      {bookModal&&<Modal title="Solicitar cita de peluquería" sub="Tu solicitud será confirmada por el equipo MOGA" onClose={()=>setBookModal(false)}>
        {booked?(
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:T.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>✅</div>
            <div style={{fontSize:20,fontWeight:800,color:T.greenText,fontFamily:T.font,marginBottom:6}}>¡Cita solicitada!</div>
            <div style={{fontSize:14,color:T.textMuted}}>El equipo MOGA te contactará pronto para confirmar.</div>
          </div>
        ):(<>
          <Select label="Mascota *" value={form.petId} onChange={e=>setForm({...form,petId:e.target.value})}>{pets.map(p=><option key={p.id} value={p.id}>{spIcon(p.species)} {p.name}</option>)}</Select>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <Input label="Fecha deseada *" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
            <Input label="Hora preferida" type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/>
          </div>
          <Select label="Servicio" value={form.service} onChange={e=>setForm({...form,service:e.target.value})}>{SERVICES.map(s=><option key={s}>{s}</option>)}</Select>
          <Input label="Notas o instrucciones" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Ej: alérgico a ciertos shampoos, nervioso..."/>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn v="ghost" onClick={()=>setBookModal(false)}>Cancelar</Btn><Btn v="accent" onClick={book}>Solicitar cita →</Btn></div>
        </>)}
      </Modal>}
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────
export default function App() {
  const [currentUser,setCurrentUser]=useState(null);
  const [users,setUsers]=useState(initUsers);
  const [pets,setPets]=useState(initPets);
  const [records,setRecords]=useState(initRecords);
  const [grooming,setGrooming]=useState(initGrooming);
  const [vaccines,setVaccines]=useState(initVaccines);
  const [payments,setPayments]=useState(initPayments);

  if(!currentUser) return <LoginScreen users={users} onLogin={setCurrentUser}/>;
  if(currentUser.role==="client"){
    const myPets=pets.filter(p=>p.ownerId===currentUser.id);
    const myPetIds=myPets.map(p=>p.id);
    return <ClientPortal
      user={currentUser} pets={myPets}
      records={records.filter(r=>myPetIds.includes(r.petId))}
      grooming={grooming.filter(g=>g.clientId===currentUser.id)}
      vaccines={vaccines.filter(v=>myPetIds.includes(v.petId))}
      payments={payments.filter(p=>p.clientId===currentUser.id)}
      onLogout={()=>setCurrentUser(null)}
      onBookGrooming={appt=>setGrooming(prev=>[...prev,{...appt,id:Date.now(),clientId:currentUser.id}])}
    />;
  }
  return <AdminDashboard
    user={currentUser} users={users} pets={pets} records={records}
    grooming={grooming} vaccines={vaccines} payments={payments}
    onLogout={()=>setCurrentUser(null)}
    onAddPet={p=>setPets(prev=>[...prev,{...p,id:Date.now()}])}
    onAddRecord={r=>setRecords(prev=>[...prev,{...r,id:Date.now()}])}
    onAddGrooming={g=>setGrooming(prev=>[...prev,{...g,id:Date.now()}])}
    onUpdateGroomingStatus={(id,s)=>setGrooming(prev=>prev.map(g=>g.id===id?{...g,status:s}:g))}
    onAddUser={u=>setUsers(prev=>[...prev,{...u,id:Date.now(),role:"client"}])}
    onAddVaccine={v=>setVaccines(prev=>[...prev,{...v,id:Date.now()}])}
    onAddPayment={p=>setPayments(prev=>[...prev,{...p,id:Date.now()}])}
    onMarkPaid={(id,m)=>setPayments(prev=>prev.map(p=>p.id===id?{...p,status:"pagado",method:m}:p))}
  />;
}
