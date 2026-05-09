import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const Appointment = {
  findAll: async (tenantId) => {
    if (useLocal()) return store.appointments.findAll(tenantId);
    let q = supabase.from("appointments").select("*").limit(10000);
    if (tenantId != null) q = q.eq("tenantId", tenantId);
    const { data, error } = await q.order("date").order("time");
    if (error) throw error;
    return data;
  },
  findByClientId: async (clientId) => {
    if (useLocal()) return store.appointments.findByClientId(clientId);
    const { data, error } = await supabase.from("appointments").select("*").eq("clientId", clientId).order("date").order("time");
    if (error) throw error;
    return data;
  },
  create: async (appt) => {
    if (useLocal()) return store.appointments.create(appt);
    const { data, error } = await supabase.from("appointments").insert([appt]).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, fields) => {
    if (useLocal()) return store.appointments.update(id, fields);
    const { data, error } = await supabase.from("appointments").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  remove: async (id) => {
    if (useLocal()) return store.appointments.remove(id);
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

export default Appointment;
