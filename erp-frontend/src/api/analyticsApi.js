import { apiRequest } from "../services/api.js";

export const getDashboardStats         = () => apiRequest("/analytics/dashboard");
export const getAssetStatusDistribution = () => apiRequest("/analytics/asset-status");
export const getTicketMetrics          = () => apiRequest("/analytics/ticket-metrics");
export const getEmployeesByDepartment  = () => apiRequest("/analytics/employees-by-dept");
export const getDepartmentPerformance  = () => apiRequest("/analytics/department-performance");
