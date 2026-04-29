import supabase from "../config/supabase.js";
import PetPhoto from "../models/PetPhoto.js";

export const getByPet = async (req, res, next) => {
  try {
    const photos = await PetPhoto.findByPetId(Number(req.params.petId));
    res.json(photos);
  } catch (err) { next(err); }
};

export const getByGrooming = async (req, res, next) => {
  try {
    const photos = await PetPhoto.findByEntryKey(`grooming_${req.params.groomingId}`);
    res.json(photos);
  } catch (err) { next(err); }
};

export const upload = async (req, res, next) => {
  try {
    const { petId, data: base64, filename, mimeType, caption, entryKey } = req.body;
    if (!petId || !base64 || !filename) return res.status(400).json({ message: "Faltan datos." });

    const clean = base64.replace(/^data:\w+\/\w+;base64,/, "");
    const buffer = Buffer.from(clean, "base64");
    const ext    = filename.split(".").pop() || "jpg";
    const path   = `${req.user.tenantId}/${petId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("pet-photos")
      .upload(path, buffer, { contentType: mimeType || "image/jpeg", upsert: false });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("pet-photos")
      .getPublicUrl(path);

    let photo;
    try {
      photo = await PetPhoto.create({
        petId:       Number(petId),
        tenantId:    req.user.tenantId,
        url:         publicUrl,
        storagePath: path,
        caption:     caption || "",
        entryKey:    entryKey || null,
      });
    } catch (createErr) {
      // Columna entryKey puede no existir aún — guardar sin ella
      if (createErr?.code === "42703" || createErr?.message?.includes("entryKey")) {
        photo = await PetPhoto.create({
          petId:       Number(petId),
          tenantId:    req.user.tenantId,
          url:         publicUrl,
          storagePath: path,
          caption:     caption || "",
        });
      } else throw createErr;
    }
    res.status(201).json(photo);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await PetPhoto.remove(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) { next(err); }
};
