import api from "./api.js";

export const getGrooming     = ()           => api.get("/grooming").then((r) => r.data);
export const createGrooming  = (appt)       => api.post("/grooming", appt).then((r) => r.data);
export const updateStatus    = (id, status) => api.patch(`/grooming/${id}/status`, { status }).then((r) => r.data);
export const deleteGrooming  = (id)         => api.delete(`/grooming/${id}`).then((r) => r.data);
