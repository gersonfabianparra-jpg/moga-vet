#!/usr/bin/env python3
"""
Migración BD antigua MOGA → Supabase ZOVITA
Lee Identificacion.csv (mascotas + dueños) e Historias.csv (fichas médicas)
y los sube a Supabase como tenantId=1 (Clínica MOGA).

Uso:
  cd /Users/gparra/Desktop/MOGA
  python3 scripts/migrate_moga.py
"""

import csv
import json
import re
import unicodedata
from datetime import datetime, date
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# ─── Configuración ────────────────────────────────────────────────────────────
SUPABASE_URL   = "https://mxoishfhzcrxaigfgayu.supabase.co"
SERVICE_KEY    = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14b2lzaGZoemNyeGFpZ2ZnYXl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI1MTQ0OCwiZXhwIjoyMDkyODI3NDQ4fQ"
    ".I7g2DS-SIZdMSE0CNqX2sF7Hkp6SvN5oH4B2h_NZ5lM"
)
TENANT_ID      = 1
CLIENT_PASSWORD = "Moga2026!"
VET_DEFAULT    = "Equipo Clínica MOGA"
BATCH          = 100   # filas por request a Supabase

IDENTIFICACION = "BDMOGA(ANTIGUO)/Identificacion.csv"
HISTORIAS      = "BDMOGA(ANTIGUO)/Historias.csv"
# ──────────────────────────────────────────────────────────────────────────────


# ─── Helpers de transformación ────────────────────────────────────────────────

def to_slug(text: str):
    """Nombre → slug apto para email (ej. 'María González' → 'maria.gonzalez')."""
    t = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-z0-9]+", ".", t.lower().strip())
    return t.strip(".")


def normalize_species(raw: str):
    s = raw.lower().strip()
    if re.search(r"\bcan|^per", s):
        return "Perro"
    if re.search(r"fe[lbnaio]|fa[li]|fl[eio]|^fel", s):
        return "Gato"
    return "Otro"


def normalize_gender(raw: str):
    g = raw.strip().upper()
    if g in ("H", "HEMBRA"):
        return "Hembra"
    if g in ("M", "MACHO"):
        return "Macho"
    return None


def parse_weight(raw: str):
    if not raw or not raw.strip():
        return None
    try:
        return round(float(raw.strip().replace(",", ".")), 2)
    except ValueError:
        return None


def parse_date(raw: str):
    """MM/DD/YY HH:MM:SS o MM/DD/YYYY → YYYY-MM-DD. Devuelve None si no parsea."""
    if not raw or not raw.strip():
        return None
    part = raw.strip().split()[0]
    for fmt in ("%m/%d/%y", "%m/%d/%Y"):
        try:
            d = datetime.strptime(part, fmt)
            # Sanity check: fechas antes de 1980 o en el futuro → None
            if d.year < 1980 or d.year > date.today().year:
                return None
            return d.strftime("%Y-%m-%d")
        except ValueError:
            pass
    return None


def calc_age(birth_str: str):
    bd = parse_date(birth_str)
    if not bd:
        return None
    try:
        bd_date = date.fromisoformat(bd)
        today = date.today()
        return today.year - bd_date.year - (
            (today.month, today.day) < (bd_date.month, bd_date.day)
        )
    except Exception:
        return None


def title_safe(text: str) -> str:
    """Title case respetando acrónimos pequeños."""
    return text.strip().title() if text else ""


def make_avatar(name: str) -> str:
    parts = name.split()
    return "".join(p[0].upper() for p in parts[:2] if p)


# ─── Supabase REST ────────────────────────────────────────────────────────────

HEADERS = {
    "apikey":        SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type":  "application/json",
    "Prefer":        "return=representation",
}


def sb_insert(table, rows, chunk=BATCH):
    """Inserta filas en lotes; devuelve todos los registros creados con sus IDs."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    inserted = []
    total = len(rows)
    for i in range(0, total, chunk):
        batch = rows[i : i + chunk]
        body = json.dumps(batch).encode("utf-8")
        req = Request(url, data=body, method="POST", headers=HEADERS)
        try:
            with urlopen(req) as resp:
                result = json.loads(resp.read())
                result = result if isinstance(result, list) else [result]
                inserted.extend(result)
                print(f"    {table}: {min(i + chunk, total)}/{total} ✓")
        except HTTPError as e:
            err = e.read().decode("utf-8", errors="replace")
            print(f"    ✗ Error en lote {i}–{i+chunk}: {err[:300]}")
    return inserted


def sb_select(table, query=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{query}"
    req = Request(url, headers=HEADERS)
    with urlopen(req) as resp:
        return json.loads(resp.read())


# ─── Migración principal ──────────────────────────────────────────────────────

def migrate():
    print("=" * 60)
    print("  MIGRACIÓN MOGA → ZOVITA (Supabase)")
    print("=" * 60)

    # ── Leer CSVs ──
    print("\n[1/4] Leyendo archivos CSV...")
    with open(IDENTIFICACION, encoding="latin-1") as f:
        id_rows = list(csv.DictReader(f))
    with open(HISTORIAS, encoding="latin-1") as f:
        hist_rows = list(csv.DictReader(f))
    print(f"  Mascotas:        {len(id_rows)}")
    print(f"  Fichas médicas:  {len(hist_rows)}")

    # ── Construir dueños únicos ──
    print("\n[2/4] Procesando propietarios y mascotas...")
    owners: dict[str, dict] = {}   # slug → user_dict
    pet_list: list[dict]    = []   # pets listos para insertar
    idpac_map: dict[str, dict] = {}  # IDPac → {owner_slug, pet_name_slug}

    for r in id_rows:
        raw_owner = (r.get("Propietario") or "").strip()
        if not raw_owner:
            raw_owner = f"Propietario {r.get('IDPac', '?')}"
        owner_key = to_slug(raw_owner)

        phone = (r.get("Tel") or "").strip() or None

        if owner_key not in owners:
            owners[owner_key] = {
                "name":     title_safe(raw_owner),
                "email":    f"{owner_key}@moga-cliente.cl",
                "phone":    phone,
                "password": CLIENT_PASSWORD,
                "role":     "client",
                "tenantId": TENANT_ID,
                "avatar":   make_avatar(raw_owner),
            }
        elif phone and not owners[owner_key]["phone"]:
            owners[owner_key]["phone"] = phone

        # Guardar relación IDPac → clave del dueño
        pet_name = title_safe(r.get("Mascotas") or f"Mascota {r.get('IDPac', '?')}")
        pet_name_slug = to_slug(pet_name)
        idpac_map[r.get("IDPac", "")] = {
            "owner_key":    owner_key,
            "pet_name":     pet_name,
            "pet_name_slug": pet_name_slug,
        }

    owner_list = list(owners.values())
    print(f"  Propietarios únicos: {len(owner_list)}")
    print(f"  Mascotas a insertar: {len(id_rows)}")

    # ── Insertar dueños ──
    print("\n  → Insertando propietarios en Supabase...")
    inserted_users = sb_insert("users", owner_list)

    # Construir mapa slug → user_id
    slug_to_uid: dict[str, int] = {}
    for u in inserted_users:
        email: str = u.get("email", "")
        s = email.replace("@moga-cliente.cl", "")
        slug_to_uid[s] = u["id"]

    if not slug_to_uid:
        print("  ✗ No se insertó ningún usuario. Revisa la conexión a Supabase.")
        return

    print(f"  Propietarios insertados: {len(slug_to_uid)}")

    # ── Preparar mascotas ──
    # Necesitamos idpac → índice en la lista de pets para recuperar el id tras el insert
    pet_order: list[str] = []   # IDPac en el mismo orden que pet_list

    for r in id_rows:
        idpac = r.get("IDPac", "")
        info = idpac_map.get(idpac)
        if not info:
            continue
        uid = slug_to_uid.get(info["owner_key"])
        if not uid:
            print(f"  ! Sin ID de usuario para IDPac={idpac}")
            continue

        pet_list.append({
            "name":     info["pet_name"],
            "species":  normalize_species(r.get("Especie") or ""),
            "breed":    title_safe(r.get("Raza") or "") or None,
            "age":      calc_age(r.get("BirthDate") or ""),
            "weight":   parse_weight(r.get("Peso") or ""),
            "color":    title_safe(r.get("Color") or "") or None,
            "gender":   normalize_gender(r.get("Sexo") or ""),
            "chip":     None,
            "ownerId":  uid,
            "tenantId": TENANT_ID,
        })
        pet_order.append(idpac)

    # ── Insertar mascotas por lotes, manteniendo el orden ──
    print("\n  → Insertando mascotas en Supabase...")
    inserted_pets = sb_insert("pets", pet_list, chunk=50)

    # Mapear IDPac → nuevo pet_id (basado en orden de inserción)
    idpac_to_pid: dict[str, int] = {}
    for idx, pet_row in enumerate(inserted_pets):
        if idx < len(pet_order):
            idpac_to_pid[pet_order[idx]] = pet_row["id"]

    print(f"  Mascotas insertadas: {len(inserted_pets)}")

    # ── Preparar fichas médicas ──
    print("\n[3/4] Procesando fichas médicas...")
    record_list: list[dict] = []

    for h in hist_rows:
        idpac = h.get("IDPac", "").strip()
        pet_id = idpac_to_pid.get(idpac)
        if not pet_id:
            continue   # mascota no encontrada (sin dueño válido)

        raw_date = h.get("FechaDeLaHistoria") or ""
        fecha = parse_date(raw_date) or "2006-01-01"   # fecha placeholder si no parsea

        notes     = (h.get("HistoriaT") or "").strip() or None
        diagnosis = (h.get("Diagnostico") or "").strip() or None
        treatment = (h.get("Tratamiento") or "").strip() or None

        record_list.append({
            "petId":      pet_id,
            "date":       fecha,
            "vet":        VET_DEFAULT,
            "type":       "consulta",
            "diagnosis":  diagnosis,
            "treatment":  treatment,
            "weight":     None,
            "temperature": None,
            "notes":      notes,
            "nextVisit":  None,
            "tenantId":   TENANT_ID,
        })

    print(f"  Fichas a insertar: {len(record_list)}")

    # ── Insertar fichas médicas ──
    print("\n  → Insertando fichas médicas en Supabase...")
    inserted_records = sb_insert("records", record_list)
    print(f"  Fichas insertadas: {len(inserted_records)}")

    # ── Resumen ──
    print("\n[4/4] Migración completada:")
    print(f"  ✓ Propietarios (users):  {len(inserted_users)}")
    print(f"  ✓ Mascotas (pets):       {len(inserted_pets)}")
    print(f"  ✓ Fichas médicas:        {len(inserted_records)}")
    print(f"  ✗ Fichas sin mascota:    {len(hist_rows) - len(inserted_records)}")
    print("\n  Credencial para todos los clientes:")
    print(f"    Contraseña: {CLIENT_PASSWORD}")
    print("=" * 60)


if __name__ == "__main__":
    migrate()
