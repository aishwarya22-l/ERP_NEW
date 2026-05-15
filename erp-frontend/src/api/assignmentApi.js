import { apiRequest } from "../services/api.js";

export const getAssignments = (page = 1, pageSize = 20) => apiRequest(`/assignments?page=${page}&pageSize=${pageSize}`);
export const getAssignmentById = (id)                 => apiRequest(`/assignments/${id}`);
export const getUsersByDepartment = (department)      => apiRequest(`/assignments/users/${department}`);
export const createAssignment = (data)                => apiRequest("/assignments", "POST", data);
export const updateAssignment = (id, data)            => apiRequest(`/assignments/${id}`, "PUT", data);
export const deleteAssignment = (id)                  => apiRequest(`/assignments/${id}`, "DELETE");
export const returnAssignment = (id, data = {})       => apiRequest(`/assignments/${id}/return`, "PUT", data);
