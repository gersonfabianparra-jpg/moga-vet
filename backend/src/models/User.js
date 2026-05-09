import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const User = {
  findAll: async (tenantId) => {
    if (useLocal()) return store.users.findAll(tenantId);
    let q = supabase.from("users").select("*").limit(10000);
    if (tenantId != null) q = q.eq("tenantId", tenantId);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  findById: async (id) => {
    if (useLocal()) return store.users.findById(id);
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },
  findByEmail: async (email) => {
    if (useLocal()) return store.users.findByEmail(email);
    const { data } = await supabase.from("users").select("*").eq("email", email).single();
    return data ?? null;
  },
  findByUsername: async (username) => {
    if (useLocal()) return store.users.findByUsername(username);
    const { data } = await supabase.from("users").select("*").eq("username", username).single();
    return data ?? null;
  },
  findByRutOrEmail: async (query) => {
    if (useLocal()) return store.users.findByRutOrEmail(query);
    const byRut = await supabase.from("users").select("*").eq("rut", query).single();
    if (byRut.data) return byRut.data;
    const byEmail = await supabase.from("users").select("*").eq("email", query).single();
    return byEmail.data ?? null;
  },
  create: async (user) => {
    if (useLocal()) return store.users.create(user);
    const { data, error } = await supabase.from("users").insert([user]).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, fields) => {
    if (useLocal()) return store.users.update(id, fields);
    const { data, error } = await supabase.from("users").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  remove: async (id) => {
    if (useLocal()) return store.users.remove(id);
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

export default User;
