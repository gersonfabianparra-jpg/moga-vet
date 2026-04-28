import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const Tenant = {
  findAll: async () => {
    if (useLocal()) return store.tenants.findAll();
    const { data, error } = await supabase.from("tenants").select("*").order("createdAt", { ascending: false });
    if (error) throw error;
    return data;
  },
  findById: async (id) => {
    if (useLocal()) return store.tenants.findById(id);
    const { data, error } = await supabase.from("tenants").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },
  findByEmail: async (email) => {
    if (useLocal()) return store.tenants.findByEmail(email);
    const { data } = await supabase.from("tenants").select("*").eq("adminEmail", email).single();
    return data ?? null;
  },
  create: async (tenant) => {
    if (useLocal()) return store.tenants.create(tenant);
    const { data, error } = await supabase.from("tenants").insert([tenant]).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, fields) => {
    if (useLocal()) return store.tenants.update(id, fields);
    const { data, error } = await supabase.from("tenants").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
};

export default Tenant;
