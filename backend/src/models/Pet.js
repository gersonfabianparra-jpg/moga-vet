import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const Pet = {
  findAll: async (tenantId) => {
    if (useLocal()) return store.pets.findAll(tenantId);
    let q = supabase.from("pets").select("*");
    if (tenantId != null) q = q.eq("tenantId", tenantId);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  findById: async (id) => {
    if (useLocal()) return store.pets.findById(id);
    const { data, error } = await supabase.from("pets").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },
  findByOwnerId: async (ownerId, tenantId) => {
    if (useLocal()) return store.pets.findByOwnerId(ownerId, tenantId);
    let q = supabase.from("pets").select("*").eq("ownerId", ownerId);
    if (tenantId != null) q = q.eq("tenantId", tenantId);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  create: async (pet) => {
    if (useLocal()) return store.pets.create(pet);
    const { data, error } = await supabase.from("pets").insert([pet]).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, fields) => {
    if (useLocal()) {
      const idx = store.pets.items.findIndex((p) => p.id === id);
      if (idx !== -1) store.pets.items[idx] = { ...store.pets.items[idx], ...fields };
      return store.pets.items[idx];
    }
    const { data, error } = await supabase.from("pets").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    if (useLocal()) { store.pets.items = (store.pets.items || []).filter((p) => p.id !== id); return; }
    const { error } = await supabase.from("pets").delete().eq("id", id);
    if (error) throw error;
  },
};

export default Pet;
