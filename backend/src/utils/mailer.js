import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const TYPE_LABEL = {
  consulta:   "Consulta veterinaria",
  control:    "Control",
  vacuna:     "Vacunación",
  peluqueria: "Peluquería",
  urgencia:   "Urgencia",
  cirugia:    "Cirugía",
};

function fmtDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${+day} de ${months[+m - 1]} de ${y}`;
}

function buildHtml({ clinicName, logoBase64, toName, petName, type, date, time, notes, clinicPhone }) {
  const typeLabel = TYPE_LABEL[type] || type || "Cita";
  const logo = logoBase64
    ? `<img src="${logoBase64}" alt="logo" style="height:48px;width:48px;object-fit:contain;border-radius:10px;background:#fff;padding:4px;"/>`
    : `<div style="width:48px;height:48px;border-radius:10px;background:#4F46E5;display:flex;align-items:center;justify-content:center;font-size:24px;">🐾</div>`;

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#4F46E5,#6366F1);padding:28px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:middle;">${logo}</td>
          <td style="vertical-align:middle;padding-left:14px;">
            <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;">${clinicName}</div>
            ${clinicPhone ? `<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:3px;">${clinicPhone}</div>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Título -->
  <tr>
    <td style="padding:28px 32px 0;">
      <div style="display:inline-block;background:#ECFDF5;color:#059669;font-size:12px;font-weight:700;padding:5px 12px;border-radius:20px;letter-spacing:0.04em;text-transform:uppercase;">
        ✓ Reserva confirmada
      </div>
      <h1 style="margin:14px 0 4px;font-size:24px;font-weight:900;color:#0F172A;letter-spacing:-0.03em;">
        ¡Hola${toName ? `, ${toName.split(" ")[0]}` : ""}!
      </h1>
      <p style="margin:0;font-size:15px;color:#475569;line-height:1.6;">
        Tu reserva ha sido registrada exitosamente. Aquí están los detalles:
      </p>
    </td>
  </tr>

  <!-- Tarjeta de cita -->
  <tr>
    <td style="padding:20px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:14px;border:1px solid #E2E8F0;overflow:hidden;">
        <tr>
          <td style="padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:14px;border-bottom:1px solid #E2E8F0;">
                  <div style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Tipo de atención</div>
                  <div style="font-size:17px;font-weight:800;color:#1E293B;">${typeLabel}</div>
                </td>
              </tr>
              <tr>
                <td style="padding-top:14px;padding-bottom:14px;border-bottom:1px solid #E2E8F0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%">
                        <div style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">📅 Fecha</div>
                        <div style="font-size:15px;font-weight:700;color:#1E293B;">${fmtDate(date)}</div>
                      </td>
                      <td width="50%">
                        <div style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">🕐 Hora</div>
                        <div style="font-size:15px;font-weight:700;color:#1E293B;">${time || "—"}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${petName ? `
              <tr>
                <td style="padding-top:14px;">
                  <div style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">🐾 Paciente</div>
                  <div style="font-size:15px;font-weight:700;color:#1E293B;">${petName}</div>
                </td>
              </tr>` : ""}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Notas -->
  ${notes ? `
  <tr>
    <td style="padding:0 32px 20px;">
      <div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:10px;padding:14px 18px;">
        <div style="font-size:11px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">📝 Notas</div>
        <div style="font-size:14px;color:#78350F;line-height:1.5;">${notes}</div>
      </div>
    </td>
  </tr>` : ""}

  <!-- Aviso -->
  <tr>
    <td style="padding:0 32px 28px;">
      <p style="margin:0;font-size:13px;color:#64748B;line-height:1.6;background:#F8FAFC;border-radius:10px;padding:14px 16px;border-left:3px solid #6366F1;">
        Si necesitas cancelar o modificar tu cita, comunícate con nosotros directamente${clinicPhone ? ` al <strong>${clinicPhone}</strong>` : ""}.
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#F1F5F9;padding:18px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#94A3B8;">
        Este correo fue generado automáticamente por <strong>${clinicName}</strong> · Powered by ZoVITA
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendConfirmation({ to, toName, petName, type, date, time, notes, clinicName, clinicPhone, logoBase64 }) {
  if (!process.env.RESEND_API_KEY) return; // silently skip if not configured
  if (!to || !to.includes("@")) return;

  const from = process.env.RESEND_FROM || `${clinicName || "Clínica Veterinaria"} <onboarding@resend.dev>`;
  const subject = `✅ Reserva confirmada — ${date ? fmtDate(date) : ""} ${time || ""}`.trim();

  try {
    await resend.emails.send({
      from,
      to: [to],
      subject,
      html: buildHtml({ clinicName: clinicName || "Clínica Veterinaria", logoBase64, toName, petName, type, date, time, notes, clinicPhone }),
    });
  } catch (err) {
    console.error("[mailer] Error enviando correo:", err?.message || err);
  }
}
