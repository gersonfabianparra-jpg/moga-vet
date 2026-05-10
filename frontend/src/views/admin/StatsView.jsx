import { useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import T from "../../styles/tokens.js";
import { fmtCLP, spIcon } from "../../styles/helpers.js";
import PageTitle from "../../components/layout/PageTitle.jsx";
import KpiCard from "../../components/layout/KpiCard.jsx";
import { vaxStatus } from "../../styles/helpers.js";

/* ── helpers ── */
const monthLabel = (iso) => {
  const [y, m] = iso.split("-");
  const names = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${names[+m - 1]} ${y.slice(2)}`;
};

function last6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

/* ── subcomponents ── */
function BarChart({ data, maxVal, color = T.brand }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, padding: "0 4px" }}>
      {data.map(({ label, value }) => {
        const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
        return (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{value > 0 ? fmtCLP(value).replace("$", "") : ""}</div>
            <div style={{ width: "100%", height: 100, display: "flex", alignItems: "flex-end" }}>
              <div style={{ width: "100%", height: `${Math.max(pct, value > 0 ? 4 : 0)}%`, background: color, borderRadius: "6px 6px 0 0", transition: "height 0.4s ease", minHeight: value > 0 ? 4 : 0 }} />
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, textAlign: "center" }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function HBar({ label, value, max, color, suffix = "" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
        <span style={{ color: T.text, fontWeight: 600 }}>{label}</span>
        <span style={{ color: T.textMuted }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 10, background: T.border, borderRadius: 6, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 6, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: T.panel, borderRadius: 16, border: `1px solid ${T.border}`, padding: "20px 24px", marginBottom: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 18 }}>{title}</div>
      {children}
    </div>
  );
}

/* ── PDF export ── */
async function exportPDF({ months, incomeByMonth, topPets, serviceCount, vaxOk, vaxBad, totalPaid, totalPend, total, pets }) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229);
  doc.text("Reporte ZOVITA", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 14, 25);

  // KPIs
  doc.setFontSize(13);
  doc.setTextColor(30);
  doc.text("Resumen financiero", 14, 36);
  autoTable(doc, {
    startY: 40,
    head: [["Métrica", "Valor"]],
    body: [
      ["Total facturado", fmtCLP(total)],
      ["Ingresos recibidos", fmtCLP(totalPaid)],
      ["Por cobrar", fmtCLP(totalPend)],
      ["Mascotas registradas", String(pets.length)],
    ],
    styles: { fontSize: 11 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  // Ingresos por mes
  doc.text("Ingresos últimos 6 meses", 14, doc.lastAutoTable.finalY + 12);
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    head: [["Mes", "Ingresos"]],
    body: months.map((m, i) => [monthLabel(m), fmtCLP(incomeByMonth[i])]),
    styles: { fontSize: 11 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  // Top mascotas
  if (topPets.length > 0) {
    doc.text("Mascotas más atendidas", 14, doc.lastAutoTable.finalY + 12);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Mascota", "Eventos"]],
      body: topPets.map((p) => [p.name, p.count]),
      styles: { fontSize: 11 },
      headStyles: { fillColor: [79, 70, 229] },
    });
  }

  // Servicios
  const svcRows = Object.entries(serviceCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (svcRows.length > 0) {
    doc.text("Servicios más solicitados", 14, doc.lastAutoTable.finalY + 12);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Servicio", "Cantidad"]],
      body: svcRows,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [79, 70, 229] },
    });
  }

  // Vacunación
  doc.text("Estado de vacunación", 14, doc.lastAutoTable.finalY + 12);
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    head: [["Estado", "Cantidad"]],
    body: [["Al día / próximas", vaxOk], ["Vencidas", vaxBad]],
    styles: { fontSize: 11 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  doc.save(`reporte-zovita-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/* ── main view ── */
export default function StatsView() {
  const { payments, pets, users, vaccines, records, grooming, appointments } = useApp();
  const { isMobile } = useBreakpoint();

  const months = useMemo(() => last6Months(), []);

  const incomeByMonth = useMemo(() => months.map((m) =>
    payments.filter((p) => p.status === "pagado" && p.date?.startsWith(m)).reduce((s, p) => s + p.amount, 0)
  ), [payments, months]);

  const maxIncome = Math.max(...incomeByMonth, 1);

  const totalPaid = payments.filter((p) => p.status === "pagado").reduce((s, p) => s + p.amount, 0);
  const totalPend = payments.filter((p) => p.status === "pendiente").reduce((s, p) => s + p.amount, 0);
  const total = payments.reduce((s, p) => s + p.amount, 0);

  // Top mascotas más atendidas (records + vaccines + grooming)
  const topPets = useMemo(() => {
    const count = {};
    [...records, ...vaccines, ...grooming].forEach((r) => {
      if (r.petId) count[r.petId] = (count[r.petId] || 0) + 1;
    });
    return Object.entries(count)
      .map(([id, c]) => ({ pet: pets.find((p) => p.id === +id), count: c }))
      .filter((x) => x.pet)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((x) => ({ name: `${spIcon(x.pet.species)} ${x.pet.name}`, count: x.count }));
  }, [records, vaccines, grooming, pets]);

  const maxPetCount = topPets[0]?.count || 1;

  // Servicios más solicitados
  const serviceCount = useMemo(() => {
    const c = {};
    records.forEach((r) => { const k = r.reason || "Consulta"; c[k] = (c[k] || 0) + 1; });
    vaccines.forEach((v) => { const k = v.name || "Vacuna"; c[k] = (c[k] || 0) + 1; });
    grooming.forEach((g) => { const k = g.service || "Peluquería"; c[k] = (c[k] || 0) + 1; });
    return c;
  }, [records, vaccines, grooming]);

  const topServices = Object.entries(serviceCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxSvc = topServices[0]?.[1] || 1;

  // Vacunación
  const vaxOk  = vaccines.filter((v) => vaxStatus(v.nextDue).key !== "red").length;
  const vaxBad = vaccines.filter((v) => vaxStatus(v.nextDue).key === "red").length;
  const vaxTotal = vaxOk + vaxBad;
  const vaxPct = vaxTotal > 0 ? Math.round((vaxOk / vaxTotal) * 100) : 0;

  // Citas del mes actual
  const thisMonth = new Date().toISOString().slice(0, 7);
  const apptThisMonth = appointments.filter((a) => a.date?.startsWith(thisMonth)).length;

  const pdfData = { months, incomeByMonth, topPets, serviceCount, vaxOk, vaxBad, totalPaid, totalPend, total, pets };

  return (
    <div style={{ padding: isMobile ? "0 14px 32px" : "0 36px 36px" }}>
      <PageTitle icon="📊" title="Estadísticas y Reportes" sub="Resumen general de la clínica"
        action={
          <button onClick={() => exportPDF(pdfData)}
            style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: "#DC2626", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>
            ⬇ Exportar PDF
          </button>
        }
      />

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <KpiCard label="Total facturado"    value={fmtCLP(total)}         icon="🧾" gradient="linear-gradient(135deg,#1e3a5f,#2563eb)" delay="0" />
        <KpiCard label="Ingresos recibidos" value={fmtCLP(totalPaid)}     icon="✅" gradient={`linear-gradient(135deg,${T.brand},${T.brandMid})`} delay="1" />
        <KpiCard label="Por cobrar"         value={fmtCLP(totalPend)}     icon="⏳" gradient="linear-gradient(135deg,#78350f,#d97706)" delay="2" />
        <KpiCard label="Citas este mes"     value={String(apptThisMonth)} icon="🗓" gradient="linear-gradient(135deg,#065f46,#10b981)" delay="3" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>

        {/* Ingresos por mes */}
        <Section title="💰 Ingresos últimos 6 meses (pagados)">
          <BarChart
            data={months.map((m, i) => ({ label: monthLabel(m), value: incomeByMonth[i] }))}
            maxVal={maxIncome}
            color={T.brand}
          />
        </Section>

        {/* Vacunación */}
        <Section title="💉 Estado de vacunación">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, marginBottom: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: "#15803D" }}>{vaxPct}%</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>al día</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 16, background: T.border, borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", width: `${vaxPct}%`, background: "linear-gradient(90deg,#22c55e,#16a34a)", borderRadius: 8, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#15803D", fontWeight: 700 }}>✓ Al día: {vaxOk}</span>
                <span style={{ color: "#DC2626", fontWeight: 700 }}>✗ Vencidas: {vaxBad}</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Top mascotas */}
        <Section title={`🐾 Mascotas más atendidas (top ${topPets.length})`}>
          {topPets.length === 0
            ? <div style={{ fontSize: 13, color: T.textMuted }}>Sin datos suficientes.</div>
            : topPets.map((p) => (
                <HBar key={p.name} label={p.name} value={p.count} max={maxPetCount} color="#6366F1" suffix=" eventos" />
              ))
          }
        </Section>

        {/* Servicios más solicitados */}
        <Section title="🏥 Servicios más solicitados">
          {topServices.length === 0
            ? <div style={{ fontSize: 13, color: T.textMuted }}>Sin datos suficientes.</div>
            : topServices.map(([svc, cnt]) => (
                <HBar key={svc} label={svc} value={cnt} max={maxSvc} color="#0EA5E9" suffix=" veces" />
              ))
          }
        </Section>

      </div>
    </div>
  );
}
