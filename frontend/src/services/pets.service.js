import api from "./api.js";

export const getPets    = ()           => api.get("/pets").then((r) => r.data);
export const getPetById = (id)         => api.get(`/pets/${id}`).then((r) => r.data);
export const createPet  = (pet)        => api.post("/pets", pet).then((r) => r.data);
export const updatePet  = (id, fields) => api.patch(`/pets/${id}`, fields).then((r) => r.data);
export const deletePet  = (id)         => api.delete(`/pets/${id}`).then((r) => r.data);
