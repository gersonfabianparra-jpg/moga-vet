import api from "./api.js";

export const getBlockedSlots  = ()       => api.get("/blocked-slots").then((r) => r.data);
export const createBlockedSlot = (slot)  => api.post("/blocked-slots", slot).then((r) => r.data);
export const removeBlockedSlot = (id)    => api.delete(`/blocked-slots/${id}`).then((r) => r.data);
