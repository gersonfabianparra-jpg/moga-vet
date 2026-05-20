import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";
import { fetchAll } from "../utils/paginate.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const Inventory = {
  findAll: async (tenantId) => {
    if (useLocal()) return store.inventory.findAll(tenantId);
    return fetchAll(() => {
      let q = supabase.from("inventory_items").select("*");
      if (tenantId != null) q = q.eq("tenantId", tenantId);
      return q;
    });
  },
  create: async (item) => {
    if (useLocal()) return store.inventory.create(item);
    const { data, error } = await supabase.from("inventory_items").insert([item]).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, fields) => {
    if (useLocal()) return store.inventory.update(id, fields);
    const { data, error } = await supabase.from("inventory_items").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  adjustStock: async (id, delta) => {
    if (useLocal()) {
      const item = store.inventory.findById(id);
      if (!item) throw new Error("No encontrado");
      const newStock = Math.max(0, item.stock + delta);
      return store.inventory.update(id, { stock: newStock });
    }
    const { data: current, error: fetchErr } = await supabase.from("inventory_items").select("stock").eq("id", id).single();
    if (fetchErr) throw fetchErr;
    const newStock = Math.max(0, current.stock + delta);
    const { data, error } = await supabase.from("inventory_items").update({ stock: newStock }).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    if (useLocal()) return store.inventory.remove(id);
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) throw error;
  },
};

export default Inventory;
