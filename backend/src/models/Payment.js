import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";
import { fetchAll } from "../utils/paginate.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const Payment = {
  findAll: async (tenantId) => {
    if (useLocal()) return store.payments.findAll(tenantId);
    return fetchAll(() => {
      let q = supabase.from("payments").select("*").order("date", { ascending: false });
      if (tenantId != null) q = q.eq("tenantId", tenantId);
      return q;
    });
  },
  findByClientId: async (clientId) => {
    if (useLocal()) return store.payments.findByClientId(clientId);
    const { data, error } = await supabase.from("payments").select("*").eq("clientId", clientId).order("date", { ascending: false });
    if (error) throw error;
    return data;
  },
  create: async (payment) => {
    if (useLocal()) return store.payments.create(payment);
    const { data, error } = await supabase.from("payments").insert([payment]).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, fields) => {
    if (useLocal()) {
      const idx = store.payments.items?.findIndex((p) => p.id === id) ?? -1;
      if (idx !== -1) store.payments.items[idx] = { ...store.payments.items[idx], ...fields };
      return store.payments.items?.[idx];
    }
    const { data, error } = await supabase.from("payments").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  abono: async (id, abonoAmount, method) => {
    if (useLocal()) return store.payments.abono(id, abonoAmount, method);
    const { data: current, error: fe } = await supabase.from("payments").select("amount, amountPaid").eq("id", id).single();
    if (fe) throw fe;
    const prev = current.amountPaid || 0;
    const newPaid = Math.min(current.amount, prev + abonoAmount);
    const newStatus = newPaid >= current.amount ? "pagado" : "abonado";
    const fields = { amountPaid: newPaid, status: newStatus, ...(method ? { method } : {}) };
    const { data, error } = await supabase.from("payments").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  markPaid: async (id, method) => {
    if (useLocal()) return store.payments.markPaid(id, method);
    const { data, error } = await supabase.from("payments").update({ status: "pagado", method }).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    if (useLocal()) { store.payments.items = (store.payments.items || []).filter((p) => p.id !== id); return; }
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) throw error;
  },
};

export default Payment;
