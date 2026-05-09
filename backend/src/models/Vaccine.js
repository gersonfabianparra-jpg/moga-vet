import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";
import { fetchAll } from "../utils/paginate.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const Vaccine = {
  findAll: async (tenantId) => {
    if (useLocal()) return store.vaccines.findAll(tenantId);
    return fetchAll(() => {
      let q = supabase.from("vaccines").select("*");
      if (tenantId != null) q = q.eq("tenantId", tenantId);
      return q;
    });
  },
  findByPetId: async (petId) => {
    if (useLocal()) return store.vaccines.findByPetId(petId);
    const { data, error } = await supabase.from("vaccines").select("*").eq("petId", petId);
    if (error) throw error;
    return data;
  },
  create: async (vaccine) => {
    if (useLocal()) return store.vaccines.create(vaccine);
    const { data, error } = await supabase.from("vaccines").insert([vaccine]).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, fields) => {
    if (useLocal()) {
      const idx = store.vaccines.items?.findIndex((v) => v.id === id) ?? -1;
      if (idx !== -1) store.vaccines.items[idx] = { ...store.vaccines.items[idx], ...fields };
      return store.vaccines.items?.[idx];
    }
    const { data, error } = await supabase.from("vaccines").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    if (useLocal()) { store.vaccines.items = (store.vaccines.items || []).filter((v) => v.id !== id); return; }
    const { error } = await supabase.from("vaccines").delete().eq("id", id);
    if (error) throw error;
  },
};

export default Vaccine;
