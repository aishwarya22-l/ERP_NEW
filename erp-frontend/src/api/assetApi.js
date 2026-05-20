import { apiRequest } from "../services/api.js";

// Assets
export const getAssets = (page = 1, pageSize = 20) => apiRequest(`/assets?page=${page}&pageSize=${pageSize}`);
export const getAssetById = (id)               => apiRequest(`/assets/${id}`);
export const createAsset = (data)              => apiRequest("/assets", "POST", data);
export const updateAsset = (id, data)          => apiRequest(`/assets/${id}`, "PUT", data);
export const deleteAsset = (id)                => apiRequest(`/assets/${id}`, "DELETE");
export const getAvailableAssets = ()           => apiRequest("/assets/available");
export const getAssignedAssets = ()            => apiRequest("/assets/assigned");
export const getAssetHistory = (id)            => apiRequest(`/assets/${id}/history`);

// Categories
export const getCategories = ()                => apiRequest("/categories");
export const getCategoryById = (id)            => apiRequest(`/categories/${id}`);
export const createCategory = (data)           => apiRequest("/categories", "POST", data);
export const updateCategory = (id, data)       => apiRequest(`/categories/${id}`, "PUT", data);
export const deleteCategory = (id)             => apiRequest(`/categories/${id}`, "DELETE");
