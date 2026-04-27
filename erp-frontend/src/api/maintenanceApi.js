/**
 * Maintenance API Module
 * Handles all API calls related to maintenance management
 */

const BASE_URL = "http://localhost:5000/api";
const MAINTENANCE_URL = `${BASE_URL}/maintenance`;

/**
 * Generic response handler
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} - Parsed JSON data
 * @throws {Error} - If response is not ok
 */
const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || "API request failed";
    throw new Error(message);
  }
  return data;
};

/**
 * Get all maintenance logs
 * @returns {Promise<Array>} - Array of maintenance log objects
 */
export const getMaintenanceLogs = async () => {
  try {
    const res = await fetch(MAINTENANCE_URL);
    return await handleResponse(res);
  } catch (error) {
    console.error("Error fetching maintenance logs:", error);
    throw error;
  }
};

/**
 * Get a specific maintenance log by ID
 * @param {number} id - Maintenance log ID
 * @returns {Promise<Object>} - Maintenance log object
 */
export const getMaintenanceLogById = async (id) => {
  try {
    const res = await fetch(`${MAINTENANCE_URL}/${id}`);
    return await handleResponse(res);
  } catch (error) {
    console.error(`Error fetching maintenance log ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new maintenance log
 * @param {Object} payload - Maintenance data
 * @param {number} payload.asset_id - Asset ID
 * @param {string} payload.issue - Issue description
 * @param {string} [payload.priority] - Priority level (low, medium, high, urgent)
 * @param {string} [payload.status] - Initial status (open, in_progress, resolved)
 * @returns {Promise<Object>} - Created maintenance log response
 */
export const createMaintenanceLog = async (payload) => {
  try {
    const res = await fetch(MAINTENANCE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error creating maintenance log:", error);
    throw error;
  }
};

/**
 * Update an existing maintenance log
 * @param {number} id - Maintenance log ID
 * @param {Object} payload - Updated maintenance data
 * @param {string} [payload.issue] - Updated issue description
 * @param {string} [payload.status] - Updated status
 * @param {string} [payload.priority] - Updated priority
 * @returns {Promise<Object>} - Updated maintenance log response
 */
export const updateMaintenanceLog = async (id, payload) => {
  try {
    const res = await fetch(`${MAINTENANCE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await handleResponse(res);
  } catch (error) {
    console.error(`Error updating maintenance log ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a maintenance log
 * @param {number} id - Maintenance log ID
 * @returns {Promise<Object>} - Delete response
 */
export const deleteMaintenanceLog = async (id) => {
  try {
    const res = await fetch(`${MAINTENANCE_URL}/${id}`, {
      method: "DELETE"
    });
    return await handleResponse(res);
  } catch (error) {
    console.error(`Error deleting maintenance log ${id}:`, error);
    throw error;
  }
};

/**
 * Get maintenance logs filtered by status
 * @param {string} status - Status to filter by (open, in_progress, resolved)
 * @returns {Promise<Array>} - Array of filtered maintenance logs
 */
export const getMaintenanceLogsByStatus = async (status) => {
  try {
    const res = await fetch(`${MAINTENANCE_URL}/status/${status}`);
    return await handleResponse(res);
  } catch (error) {
    console.error(`Error fetching maintenance logs by status ${status}:`, error);
    throw error;
  }
};

/**
 * Get maintenance logs for a specific asset
 * @param {number} assetId - Asset ID
 * @returns {Promise<Array>} - Array of maintenance logs for the asset
 */
export const getMaintenanceLogsByAsset = async (assetId) => {
  try {
    const res = await fetch(`${MAINTENANCE_URL}/asset/${assetId}`);
    return await handleResponse(res);
  } catch (error) {
    console.error(`Error fetching maintenance logs for asset ${assetId}:`, error);
    throw error;
  }
};
