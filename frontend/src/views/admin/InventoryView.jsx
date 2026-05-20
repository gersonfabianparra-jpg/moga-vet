import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import T from "../../styles/tokens.js";
import { fmtCLP } from "../../styles/helpers.js";
import PageTitle from "../../components/layout/PageTitle.jsx";
import KpiCard   from "../../components/layout/KpiCard.jsx";
import Modal     from "../../components/ui/Modal.jsx";
import Input     from "../../components/ui/Input.jsx";
import Select    from "../../components/ui/Select.jsx";
import Btn       from "../../components/ui/Btn.jsx";

const CATS = ["vacuna", "medicamento", "peluqueria", "otro"];
const CAT_LABEL = { vacuna:"Vacuna", medicamento:"Medicamento", peluqueria:"Peluquería", otro:"Otro" };
const CAT_COLOR = { vacuna:"#6366F1", medicamento:"#0EA5E9", peluqueria:"#F59E0B", otro:"#6B7280" };
const UNITS = ["unidad", "frasco", "ml", "mg", "caja", "rollo"];

const EMPTY = { name:"", category:"vacuna", stock:"", minStock:"5", unit:"unidad", price:"", notes:"" };

function stockColor(stock, minStock) {
  if (stock === 0) return "#DC2626";
  if (stock <= minStock) return "#F59E0B";
  return "#16A34A";
}

function stockLabel(stock, minStock) {
  if (stock === 0) return "Sin stock";
  if (stock <= minStock) return "Stock bajo";
  return "OK";
}

function ItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item
    ? { name:item.name, category:item.category, stock:String(item.stock), minStock:String(item.minStock), unit:item.unit, price:String(item.price||""), notes:item.notes||"" }
    : EMPTY
  );
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    if (!form.name.trim()) { setErr("El nombre es obligatorio."); return; }
    if (form.stock === "" || isNaN(+form.stock)) { setErr("Stock debe ser un número."); return; }
    setBusy(true); setErr("");
    try {
      await onSave({
        name:     form.name.trim(),
        category: form.category,
        stock:    Math.max(0, +form.stock),
        minStock: Math.max(0, +form.minStock || 0),
        unit:     form.unit,
        price:    +form.price || 0,
        notes:    form.notes.trim(),
      });
      onClose();
    } catch { setErr("Error al guardar. Intenta de nuevo."); }
    finally  { setBusy(false); }
  };

  return (
    <Modal title={item ? "Editar producto" : "Nuevo producto"} onClose={onClose}>
      <Input label="Nombre *" value={form.name} onChange={f("name")} placeholder="Ej: Amoxicilina 500mg" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Select label="Categoría" value={form.category} onChange={f("category")}>
          {CATS.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
        </Select>
        <Select label="Unidad" value={form.unit} onChange={f("unit")}>
          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
        <Input label="Stock actual *" type="number" min="0" value={form.stock} onChange={f("stock")} placeholder="0" />
        <Input label="Alerta bajo stock" type="number" min="0" value={form.minStock} onChange={f("minStock")} placeholder="5" />
      </div>
      <Input label="Precio de costo ($)" type="number" min="0" value={form.price} onChange={f("price")} placeholder="0" />
      <Input label="Notas" value={form.notes} onChange={f("notes")} placeholder="Refrigerar, lote, etc." />
      {err && <div style={{ fontSize:13, color:"#DC2626", marginTop:-6 }}>⚠ {err}</div>}
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <Btn v="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn v="accent" onClick={save} disabled={busy}>{busy ? "Guardando…" : (item ? "Guardar cambios" : "Crear producto")}</Btn>
      </div>
    </Modal>
  );
}

function AdjustModal({ item, onClose, onAdjust }) {
  const [delta, setDelta] = useState("");
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState("");

  const apply = async (sign) => {
    const n = +delta;
    if (!delta || isNaN(n) || n <= 0) { setErr("Ingresa una cantidad válida."); return; }
    setBusy(true); setErr("");
    try {
      await onAdjust(item.id, sign * n);
      onClose();
    } catch { setErr("Error al ajustar."); }
    finally  { setBusy(false); }
  };

  const preview = delta && !isNaN(+delta) ? Math.max(0, item.stock + +delta) : null;
  const previewMinus = delta && !isNaN(+delta) ? Math.max(0, item.stock - +delta) : null;

  return (
    <Modal title={`Ajustar stock — ${item.name}`} onClose={onClose}>
      <div style={{ background:T.panel, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 16px", marginBottom:12 }}>
        <div style={{ fontSize:12, color:T.textMuted, marginBottom:4 }}>Stock actual</div>
        <div style={{ fontSize:28, fontWeight:800, color:"#fff" }}>
          {item.stock} <span style={{ fontSize:13, color:T.textMuted }}>{item.unit}</span>
        </div>
      </div>
      <Input label="Cantidad a mover" type="number" min="1" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="Ej: 10" />
      {err && <div style={{ fontSize:13, color:"#DC2626", marginTop:-6 }}>⚠ {err}</div>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:4 }}>
        <button
          onClick={() => apply(1)}
          disabled={busy}
          style={{ padding:"12px 0", borderRadius:10, border:"none", background:"#16A34A", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:T.font }}
        >
          ＋ Entrada {preview !== null ? `→ ${preview}` : ""}
        </button>
        <button
          onClick={() => apply(-1)}
          disabled={busy}
          style={{ padding:"12px 0", borderRadius:10, border:"none", background:"#DC2626", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:T.font }}
        >
          － Salida {previewMinus !== null ? `→ ${previewMinus}` : ""}
        </button>
      </div>
    </Modal>
  );
}

function DeleteModal({ item, onClose, onDelete }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Eliminar producto" onClose={onClose}>
      <p style={{ color:T.text, fontSize:14, margin:"0 0 16px" }}>
        ¿Eliminar <strong>{item.name}</strong> del inventario? Esta acción no se puede deshacer.
      </p>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <Btn v="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn v="danger" disabled={busy} onClick={async () => { setBusy(true); await onDelete(item.id); onClose(); }}>
          {busy ? "Eliminando…" : "Eliminar"}
        </Btn>
      </div>
    </Modal>
  );
}

export default function InventoryView() {
  const { inventory, addInventoryItem, updateInventoryItem, adjustInventoryStock, removeInventoryItem } = useApp();
  const { isMobile } = useBreakpoint();

  const [catF,   setCatF]   = useState("");
  const [search, setSearch] = useState("");
  const [modal,  setModal]  = useState(null); // null | "new" | "edit" | "adjust" | "delete"
  const [target, setTarget] = useState(null);

  const filtered = useMemo(() => {
    let list = [...inventory];
    if (catF)   list = list.filter((i) => i.category === catF);
    if (search) list = list.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory, catF, search]);

  const lowStock  = inventory.filter((i) => i.stock <= i.minStock);
  const noStock   = inventory.filter((i) => i.stock === 0);
  const totalValue = inventory.reduce((s, i) => s + (i.stock * (i.price || 0)), 0);

  const openEdit   = (item) => { setTarget(item); setModal("edit"); };
  const openAdjust = (item) => { setTarget(item); setModal("adjust"); };
  const openDelete = (item) => { setTarget(item); setModal("delete"); };

  return (
    <div style={{ padding: isMobile ? "0 14px 32px" : "0 36px 36px" }}>
      <PageTitle
        icon="📦"
        title="Inventario"
        sub="Stock de vacunas, medicamentos y productos"
        action={
          <Btn v="accent" onClick={() => setModal("new")}>＋ Agregar producto</Btn>
        }
      />

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:14, marginBottom:22 }}>
        <KpiCard label="Total productos"  value={String(inventory.length)}  icon="📦" gradient="linear-gradient(135deg,#1e3a5f,#2563eb)" delay="0" />
        <KpiCard label="Alertas stock bajo" value={String(lowStock.length)} icon="⚠️" gradient="linear-gradient(135deg,#78350f,#d97706)" delay="1" />
        <KpiCard label="Sin stock"         value={String(noStock.length)}   icon="🚫" gradient="linear-gradient(135deg,#7f1d1d,#dc2626)" delay="2" />
        <KpiCard label="Valor en inventario" value={fmtCLP(totalValue)}     icon="💰" gradient={`linear-gradient(135deg,${T.brand},${T.brandMid})`} delay="3" />
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto…"
          style={{ flex:1, minWidth:160, padding:"9px 14px", borderRadius:10, border:`1px solid ${T.border}`, background:T.input, color:T.text, fontSize:13, fontFamily:T.font, outline:"none" }}
        />
        <div style={{ display:"flex", gap:6 }}>
          {["", ...CATS].map((c) => (
            <button key={c}
              onClick={() => setCatF(c)}
              style={{
                padding:"8px 14px", borderRadius:20, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:600, fontFamily:T.font,
                background: catF === c ? (c ? CAT_COLOR[c] : T.brand) : "rgba(255,255,255,0.06)",
                color: catF === c ? "#fff" : T.textMuted,
                transition:"all 0.15s",
              }}
            >{c ? CAT_LABEL[c] : "Todos"}</button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background:T.panel, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden" }}>
        {/* Header */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr 80px 70px" : "2fr 120px 90px 90px 110px 110px 120px",
          gap:0, padding:"10px 16px",
          borderBottom:`1px solid ${T.border}`,
          fontSize:11, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.06em",
        }}>
          <span>Producto</span>
          {!isMobile && <span style={{ textAlign:"center" }}>Categoría</span>}
          <span style={{ textAlign:"center" }}>Stock</span>
          {!isMobile && <span style={{ textAlign:"center" }}>Mínimo</span>}
          {!isMobile && <span style={{ textAlign:"center" }}>Unidad</span>}
          {!isMobile && <span style={{ textAlign:"right" }}>P. costo</span>}
          <span style={{ textAlign:"center" }}>Acciones</span>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding:"40px 0", textAlign:"center", color:T.textMuted, fontSize:14 }}>
            {inventory.length === 0 ? "No hay productos en el inventario. Agrega uno." : "Sin resultados para el filtro."}
          </div>
        )}

        {filtered.map((item, idx) => {
          const color = stockColor(item.stock, item.minStock);
          const isLow = item.stock <= item.minStock;
          return (
            <div key={item.id} style={{
              display:"grid",
              gridTemplateColumns: isMobile ? "1fr 80px 70px" : "2fr 120px 90px 90px 110px 110px 120px",
              gap:0, padding:"13px 16px", alignItems:"center",
              borderBottom: idx < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              background: isLow ? "rgba(245,158,11,0.04)" : "transparent",
              transition:"background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = isLow ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)"}
            onMouseLeave={(e) => e.currentTarget.style.background = isLow ? "rgba(245,158,11,0.04)" : "transparent"}
            >
              {/* Nombre */}
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:T.text }}>{item.name}</div>
                {item.notes && <div style={{ fontSize:11, color:T.textMuted, marginTop:1 }}>{item.notes}</div>}
              </div>
              {/* Categoría */}
              {!isMobile && (
                <div style={{ textAlign:"center" }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:20, background: CAT_COLOR[item.category] + "22", color: CAT_COLOR[item.category] }}>
                    {CAT_LABEL[item.category]}
                  </span>
                </div>
              )}
              {/* Stock */}
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:16, fontWeight:800, color }}>
                  {item.stock}
                </div>
                <div style={{ fontSize:10, fontWeight:600, color, opacity:0.8 }}>{stockLabel(item.stock, item.minStock)}</div>
              </div>
              {/* Mínimo */}
              {!isMobile && (
                <div style={{ textAlign:"center", fontSize:13, color:T.textMuted }}>{item.minStock}</div>
              )}
              {/* Unidad */}
              {!isMobile && (
                <div style={{ textAlign:"center", fontSize:13, color:T.textMuted }}>{item.unit}</div>
              )}
              {/* Precio */}
              {!isMobile && (
                <div style={{ textAlign:"right", fontSize:13, color:T.text }}>{item.price ? fmtCLP(item.price) : "—"}</div>
              )}
              {/* Acciones */}
              <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
                <button
                  onClick={() => openAdjust(item)}
                  title="Ajustar stock"
                  style={{ padding:"5px 8px", borderRadius:7, border:"none", background:"rgba(99,102,241,0.15)", color:"#818CF8", cursor:"pointer", fontSize:14, fontFamily:T.font }}
                >⇅</button>
                <button
                  onClick={() => openEdit(item)}
                  title="Editar"
                  style={{ padding:"5px 8px", borderRadius:7, border:"none", background:"rgba(255,255,255,0.06)", color:T.textMuted, cursor:"pointer", fontSize:14 }}
                >✎</button>
                <button
                  onClick={() => openDelete(item)}
                  title="Eliminar"
                  style={{ padding:"5px 8px", borderRadius:7, border:"none", background:"rgba(220,38,38,0.1)", color:"#DC2626", cursor:"pointer", fontSize:13 }}
                >🗑</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modales */}
      {modal === "new" && (
        <ItemModal onClose={() => setModal(null)} onSave={addInventoryItem} />
      )}
      {modal === "edit" && target && (
        <ItemModal item={target} onClose={() => { setModal(null); setTarget(null); }} onSave={(fields) => updateInventoryItem(target.id, fields)} />
      )}
      {modal === "adjust" && target && (
        <AdjustModal item={target} onClose={() => { setModal(null); setTarget(null); }} onAdjust={adjustInventoryStock} />
      )}
      {modal === "delete" && target && (
        <DeleteModal item={target} onClose={() => { setModal(null); setTarget(null); }} onDelete={removeInventoryItem} />
      )}
    </div>
  );
}
