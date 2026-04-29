import supabase from "../config/supabase.js";

const ClinicSettings = {
  find: async (tenantId) => {
    const { data, error } = await supabase
      .from("clinic_settings")
      .select("*")
      .eq("tenantId", tenantId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  upsert: async (tenantId, fields) => {
    const now = new Date().toISOString();

    // Verificar si ya existe un registro para este tenant
    const { data: existing } = await supabase
      .from("clinic_settings")
      .select("id")
      .eq("tenantId", tenantId)
      .maybeSingle();

    if (existing) {
      // UPDATE
      const { data, error } = await supabase
        .from("clinic_settings")
        .update({ ...fields, updatedAt: now })
        .eq("tenantId", tenantId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // INSERT
      const { data, error } = await supabase
        .from("clinic_settings")
        .insert([{ tenantId, ...fields, updatedAt: now }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },
};

export default ClinicSettings;
