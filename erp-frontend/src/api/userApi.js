import { apiRequest } from "../services/api.js";

export const getUsers = (page = 1, pageSize = 10) =>
  apiRequest(`/employees?page=${page}&pageSize=${pageSize}`);

export const getEmployees = (page = 1, pageSize = 10) =>
  apiRequest(`/employees?page=${page}&pageSize=${pageSize}`);

export const createUser = (data) => apiRequest("/employees", "POST", data);

export const updateUser = (id, data) => apiRequest(`/employees/${id}`, "PUT", data);

export const deleteUser = (id) => apiRequest(`/employees/${id}`, "DELETE");
