import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const Pet = {
  findAll: async () => {
    if (useLocal()) return store.pets.findAll();
    const { data, error } = await supabase.from("pets").select("*");
    if (error) throw error;
    return data;
  },
  findById: async (id) => {
    if (useLocal()) return store.pets.findById(id);
    const { data, error } = await supabase.from("pets").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },
  findByOwnerId: async (ownerId) => {
    if (useLocal()) return store.pets.findByOwnerId(ownerId);
    const { data, error } = await supabase.from("pets").select("*").eq("ownerId", ownerId);
    if (error) throw error;
    return data;
  },
  create: async (pet) => {
    if (useLocal()) return store.pets.create(pet);
    const { data, error } = await supabase.from("pets").insert([pet]).select().single();
    if (error) throw error;
    return data;
  },
};

export default Pet;
