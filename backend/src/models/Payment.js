import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const Payment = {
  findAll: async (tenantId) => {
    if (useLocal()) return store.payments.findAll(tenantId);
    let q = supabase.from("payments").select("*").limit(10000);
    if (tenantId != null) q = q.eq("tenantId", tenantId);
    const { data, error } = await q.order("date", { ascending: false });
    if (error) throw error;
    return data;
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
