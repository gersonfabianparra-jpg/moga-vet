import api from "./api.js";

export const getPhotos = (petId) =>
  api.get(`/photos/pet/${petId}`).then((r) => r.data);

// Comprime la imagen antes de enviar (max 1400px, quality 0.82)
function compressToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 1400;
        const scale = img.width > MAX ? MAX / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export const uploadPhoto = async (petId, file, caption = "", entryKey = null) => {
  const base64 = await compressToBase64(file);
  const res = await api.post("/photos", {
    petId,
    data: base64,
    filename: file.name || "foto.jpg",
    mimeType: "image/jpeg",
    caption,
    entryKey,
  });
  return res.data;
};

export const deletePhoto = (id) => api.delete(`/photos/${id}`);

export const getGroomingPhotos = (groomingId) =>
  api.get(`/photos/grooming/${groomingId}`).then((r) => r.data);

export const uploadGroomingPhoto = async (groomingId, petId, file, caption = "") => {
  const base64 = await compressToBase64(file);
  const res = await api.post("/photos", {
    petId,
    data:     base64,
    filename: file.name || "foto.jpg",
    mimeType: "image/jpeg",
    caption,
    entryKey: `grooming_${groomingId}`,
  });
  return res.data;
};
