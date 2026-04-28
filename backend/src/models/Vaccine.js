import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const Vaccine = {
  findAll: async () => {
    if (useLocal()) return store.vaccines.findAll();
    const { data, error } = await supabase.from("vaccines").select("*");
    if (error) throw error;
    return data;
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
};

export default Vaccine;
