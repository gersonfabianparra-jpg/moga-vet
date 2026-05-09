import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";
import { fetchAll } from "../utils/paginate.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const Grooming = {
  findAll: async (tenantId) => {
    if (useLocal()) return store.grooming.findAll(tenantId);
    return fetchAll(() => {
      let q = supabase.from("grooming").select("*").order("date");
      if (tenantId != null) q = q.eq("tenantId", tenantId);
      return q;
    });
  },
  findByClientId: async (clientId) => {
    if (useLocal()) return store.grooming.findByClientId(clientId);
    const { data, error } = await supabase.from("grooming").select("*").eq("clientId", clientId).order("date");
    if (error) throw error;
    return data;
  },
  create: async (appt) => {
    if (useLocal()) return store.grooming.create(appt);
    const { data, error } = await supabase.from("grooming").insert([appt]).select().single();
    if (error) throw error;
    return data;
  },
  updateStatus: async (id, status) => {
    if (useLocal()) return store.grooming.updateStatus(id, status);
    const { data, error } = await supabase.from("grooming").update({ status }).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    if (useLocal()) { store.grooming.items = (store.grooming.items || []).filter((g) => g.id !== id); return; }
    const { error } = await supabase.from("grooming").delete().eq("id", id);
    if (error) throw error;
  },
};

export default Grooming;
