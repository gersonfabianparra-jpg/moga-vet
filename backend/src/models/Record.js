import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const Record = {
  findAll: async () => {
    if (useLocal()) return store.records.findAll();
    const { data, error } = await supabase.from("records").select("*");
    if (error) throw error;
    return data;
  },
  findByPetId: async (petId) => {
    if (useLocal()) return store.records.findByPetId(petId);
    const { data, error } = await supabase.from("records").select("*").eq("petId", petId).order("date", { ascending: false });
    if (error) throw error;
    return data;
  },
  create: async (record) => {
    if (useLocal()) return store.records.create(record);
    const { data, error } = await supabase.from("records").insert([record]).select().single();
    if (error) throw error;
    return data;
  },
};

export default Record;
