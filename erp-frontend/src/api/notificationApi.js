import { apiRequest } from "../services/api.js";

export const getNotifications  = ()   => apiRequest("/notifications");
export const getUnreadCount    = ()   => apiRequest("/notifications/unread-count");
export const markRead          = (id) => apiRequest(`/notifications/${id}/read`, "PUT");
export const markAllRead       = ()   => apiRequest("/notifications/read-all", "PUT");
