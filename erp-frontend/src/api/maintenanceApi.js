import { apiRequest } from "../services/api.js";

export const getMaintenanceLogs = (page = 1, pageSize = 20) => apiRequest(`/maintenance?page=${page}&pageSize=${pageSize}`);
export const getMaintenanceLogById = (id)              => apiRequest(`/maintenance/${id}`);
export const createMaintenanceLog = (data)             => apiRequest("/maintenance", "POST", data);
export const updateMaintenanceLog = (id, data)         => apiRequest(`/maintenance/${id}`, "PUT", data);
export const deleteMaintenanceLog = (id)               => apiRequest(`/maintenance/${id}`, "DELETE");
export const getMaintenanceLogsByStatus = (status)     => apiRequest(`/maintenance/status/${status}`);
export const getMaintenanceLogsByAsset = (assetId)     => apiRequest(`/maintenance/asset/${assetId}`);
