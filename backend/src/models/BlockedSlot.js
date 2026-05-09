import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const BlockedSlot = {
  findAll: async (tenantId) => {
    if (useLocal()) return store.blockedSlots.findAll(tenantId);
    let q = supabase.from("blocked_slots").select("*").limit(10000);
    if (tenantId != null) q = q.eq("tenantId", tenantId);
    const { data, error } = await q.order("date").order("startTime");
    if (error) throw error;
    return data;
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
