import api from "./api.js";

export const getInventory    = ()            => api.get("/inventory").then((r) => r.data);
export const createItem      = (item)        => api.post("/inventory", item).then((r) => r.data);
export const updateItem      = (id, fields)  => api.put(`/inventory/${id}`, fields).then((r) => r.data);
export const adjustStock     = (id, delta)   => api.patch(`/inventory/${id}/adjust`, { delta }).then((r) => r.data);
export const deleteItem      = (id)          => api.delete(`/inventory/${id}`).then((r) => r.data);
