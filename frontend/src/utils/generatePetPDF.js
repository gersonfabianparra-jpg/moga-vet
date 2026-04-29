import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { vaxStatus } from "../styles/helpers.js";

const BRAND = [99, 102, 241];
const DARK  = [15, 23, 42];
const MUTED = [100, 116, 139];
const WHITE = [255, 255, 255];

function tipoLabel(texto) {
  const t = texto.toLowerCase();
  if (/vacun|octuple|rabia|antirrab|parvovirus|leucemia|puppy/.test(t)) return "VACUNACIÓN";
  if (/cirug|operar|anestes|castrac|esteriliz|biopsia/.test(t))          return "CIRUGÍA";
  if (/desparasit|mebermic|milbemaxi|drontal/.test(t))                   return "DESPARASIT.";
  if (/otitis|urgencia|dolor|vomit|diarrea|crisis|convuls|fractura/.test(t)) return "URGENCIA";
  if (/chip|microchip|implan/.test(t))                                   return "MICROCHIP";
  return "CONTROL";
}

function buildHeader(doc, W, today, settings) {
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, W, 30, "F");

  if (settings?.logoBase64) {
    try {
      doc.addImage(settings.logoBase64, "PNG", W - 54, 4, 22, 22);
    } catch {
      try { doc.addImage(settings.logoBase64, "JPEG", W - 54, 4, 22, 22); } catch {}
    }
  }

  const clinicName = settings?.clinicName || "ZOVITA";
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(clinicName, 14, 11);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  if (settings?.slogan) doc.text(settings.slogan, 14, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(settings?.address ? `${settings.address}` : "Plataforma de gestión veterinaria", 14, settings?.slogan ? 20 : 18);
  doc.text(
    [settings?.phone, settings?.email, settings?.website, `Generado el ${today}`].filter(Boolean).join("  ·  "),
    14, settings?.slogan ? 25 : 23
  );
}

// ── Construye el documento PDF y devuelve {doc, filename} ─────────────────────
function buildPetDoc({ pet, owner, entradas, vaccines, settings }) {
  const doc   = new jsPDF({ unit: "mm", format: "a4" });
  const W     = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString("es-CL", { day:"2-digit", month:"long", year:"numeric" });

  buildHeader(doc, W, today, settings);

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(pet.name, 14, 43);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`${pet.species}  ·  ${pet.breed || "Sin raza"}`, 14, 50);

  autoTable(doc, {
    startY: 55,
    head: [["Especie", "Género", "Edad", "Peso", "Color", "Microchip"]],
    body: [[
      pet.species,
      pet.gender  || "—",
      pet.age     ? `${pet.age} años`  : "—",
      pet.weight  ? `${pet.weight} kg` : "—",
      pet.color   || "—",
      pet.chip    || "No registrado",
    ]],
    styles:     { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: BRAND, textColor: WHITE, fontStyle: "bold" },
    margin:     { left: 14, right: 14 },
  });

  let curY = doc.lastAutoTable.finalY + 10;

  if (owner) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND);
    doc.text("PROPIETARIO", 14, curY);
    curY += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);
    doc.text(
      [owner.name, owner.phone || "Sin teléfono", owner.email].filter(Boolean).join("   ·   "),
      14, curY
    );
    curY += 10;
  }

  if (vaccines.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND);
    doc.text("VACUNAS", 14, curY);
    curY += 2;
    autoTable(doc, {
      startY: curY + 2,
      head: [["Vacuna", "Aplicada", "Próxima dosis", "Estado"]],
      body: vaccines.map((v) => {
        const st = vaxStatus(v.nextDue);
        return [v.name, v.dateApplied || "—", v.nextDue || "—", st.label];
      }),
      styles:       { fontSize: 8.5, cellPadding: 3 },
      headStyles:   { fillColor: [79, 70, 229], textColor: WHITE, fontStyle: "bold" },
      margin:       { left: 14, right: 14 },
    });
    curY = doc.lastAutoTable.finalY + 10;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND);
  doc.text("HISTORIAL MÉDICO", 14, curY);
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.4);
  doc.line(14, curY + 2, W - 14, curY + 2);

  const cronologico = [...entradas].sort((a, b) => a.obj - b.obj);

  autoTable(doc, {
    startY: curY + 7,
    head: [["#", "Fecha", "Tipo", "Descripción", "Veterinario"]],
    body: cronologico.map((e, idx) => [
      idx + 1,
      e.label,
      tipoLabel(e.texto),
      e.texto,
      e.vet || "—",
    ]),
    styles:       { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
    headStyles:   { fillColor: BRAND, textColor: WHITE, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 8,  halign: "center" },
      1: { cellWidth: 24 },
      2: { cellWidth: 24, fontStyle: "bold" },
      3: { cellWidth: "auto" },
      4: { cellWidth: 30 },
    },
    margin:       { left: 14, right: 14 },
    rowPageBreak: "auto",
  });

  const pageCount = doc.getNumberOfPages();
  const clinicName = settings?.clinicName || "ZOVITA";
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(
      `${clinicName}  ·  Informe clínico de ${pet.name}  ·  Página ${i} de ${pageCount}`,
      W / 2, doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  return { doc, filename: `Informe_${pet.name}_${new Date().toISOString().slice(0,10)}.pdf` };
}

// ── Descarga directa ──────────────────────────────────────────────────────────
export function generatePetPDF(args) {
  const { doc, filename } = buildPetDoc(args);
  doc.save(filename);
}

// ── Devuelve blob URL para previsualización ───────────────────────────────────
export function previewPetPDF(args) {
  const { doc, filename } = buildPetDoc(args);
  const blob = doc.output("blob");
  const url  = URL.createObjectURL(blob);
  return { url, filename, doc };
}

// ─────────────────────────────────────────────────────────────────────────────
function buildGroomingDoc({ grooming, pet, client, settings }) {
  const doc   = new jsPDF({ unit: "mm", format: "a4" });
  const W     = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString("es-CL", { day:"2-digit", month:"long", year:"numeric" });

  buildHeader(doc, W, today, settings);

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`Servicio de Peluquería — ${pet?.name || ""}`, 14, 43);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Cliente: ${client?.name || "—"}  ·  ${client?.phone || ""}`, 14, 50);

  autoTable(doc, {
    startY: 56,
    head: [["Servicio", "Fecha", "Hora", "Precio", "Estado", "Notas"]],
    body: [[
      grooming.service,
      grooming.date,
      grooming.time,
      `$${Number(grooming.price || 0).toLocaleString("es-CL")}`,
      grooming.status,
      grooming.notes || "—",
    ]],
    styles:     { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: BRAND, textColor: WHITE, fontStyle: "bold" },
    margin:     { left: 14, right: 14 },
  });

  const pageCount = doc.getNumberOfPages();
  const clinicName = settings?.clinicName || "ZOVITA";
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(
      `${clinicName}  ·  Servicio de Peluquería  ·  Página ${i} de ${pageCount}`,
      W / 2, doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }
  return { doc, filename: `Peluqueria_${pet?.name || "mascota"}_${grooming.date}.pdf` };
}

export function generateGroomingPDF(args) {
  const { doc, filename } = buildGroomingDoc(args);
  doc.save(filename);
}

export function previewGroomingPDF(args) {
  const { doc, filename } = buildGroomingDoc(args);
  const blob = doc.output("blob");
  const url  = URL.createObjectURL(blob);
  return { url, filename, doc };
}
