import { apiRequest } from "../services/api.js";

export const getTickets = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
  ).toString();
  return apiRequest(`/tickets${qs ? `?${qs}` : ""}`);
};

export const getTicketById    = (id)        => apiRequest(`/tickets/${id}`);
export const createTicket     = (data)      => apiRequest("/tickets", "POST", data);
export const updateTicket     = (id, data)  => apiRequest(`/tickets/${id}`, "PUT", data);
export const deleteTicket     = (id)        => apiRequest(`/tickets/${id}`, "DELETE");
