import supabase from "../config/supabase.js";

const PetPhoto = {
  findByPetId: async (petId) => {
    const { data, error } = await supabase
      .from("pet_photos")
      .select("*")
      .eq("petId", petId)
      .order("uploadedAt", { ascending: false });
    if (error) throw error;
    return data;
  },
  findByEntryKey: async (entryKey) => {
    const { data, error } = await supabase
      .from("pet_photos")
      .select("*")
      .eq("entryKey", entryKey)
      .order("uploadedAt", { ascending: false });
    if (error) throw error;
    return data;
  },
  create: async (photo) => {
    const { data, error } = await supabase
      .from("pet_photos")
      .insert([photo])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  remove: async (id) => {
    const { error } = await supabase.from("pet_photos").delete().eq("id", id);
    if (error) throw error;
  },
};

export default PetPhoto;
