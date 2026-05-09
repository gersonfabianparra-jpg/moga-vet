import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";
import { fetchAll } from "../utils/paginate.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const BlockedSlot = {
  findAll: async (tenantId) => {
    if (useLocal()) return store.blockedSlots.findAll(tenantId);
    return fetchAll(() => {
      let q = supabase.from("blocked_slots").select("*").order("date").order("startTime");
      if (tenantId != null) q = q.eq("tenantId", tenantId);
      return q;
    });
  },
  create: async (slot) => {
    if (useLocal()) return store.blockedSlots.create(slot);
    const { data, error } = await supabase.from("blocked_slots").insert([slot]).select().single();
    if (error) throw error;
    return data;
  },
  remove: async (id) => {
    if (useLocal()) return store.blockedSlots.remove(id);
    const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

export default BlockedSlot;
