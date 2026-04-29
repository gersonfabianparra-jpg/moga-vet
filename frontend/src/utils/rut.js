// Limpia el RUT (quita puntos, guión, espacios) y lo pasa a mayúsculas
export function cleanRut(rut = "") {
  return String(rut).replace(/[.\-\s]/g, "").toUpperCase();
}

// Formatea el RUT como XX.XXX.XXX-X
export function formatRut(rut = "") {
  const clean = cleanRut(rut);
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv   = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}

// Valida el dígito verificador del RUT chileno (Mod11)
export function validateRut(rut = "") {
  const clean = cleanRut(rut);
  if (clean.length < 2) return false;

  const body = clean.slice(0, -1);
  const dv   = clean.slice(-1);

  if (!/^\d+$/.test(body)) return false;
  if (body.length < 7 || body.length > 8) return false;

  let sum  = 0;
  let mult = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }

  const computed = 11 - (sum % 11);
  let expected;
  if (computed === 11)      expected = "0";
  else if (computed === 10) expected = "K";
  else                      expected = String(computed);

  return dv === expected;
}
