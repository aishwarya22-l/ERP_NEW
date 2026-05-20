import { apiRequest } from "../services/api.js";

export const getRoles = ()           => apiRequest("/roles");
export const getRoleById = (id)      => apiRequest(`/roles/${id}`);
export const createRole = (data)     => apiRequest("/roles", "POST", data);
export const updateRole = (id, data) => apiRequest(`/roles/${id}`, "PUT", data);
export const deleteRole = (id)       => apiRequest(`/roles/${id}`, "DELETE");
