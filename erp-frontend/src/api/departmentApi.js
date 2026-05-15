import { apiRequest } from "../services/api.js";

export const getDepartments = ()              => apiRequest("/departments");
export const getDepartmentById = (id)         => apiRequest(`/departments/${id}`);
export const createDepartment = (data)        => apiRequest("/departments", "POST", data);
export const updateDepartment = (id, data)    => apiRequest(`/departments/${id}`, "PUT", data);
export const deleteDepartment = (id)          => apiRequest(`/departments/${id}`, "DELETE");
