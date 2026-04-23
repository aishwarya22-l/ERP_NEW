const BASE_URL = "http://localhost:5000/api";
const ASSETS_URL = `${BASE_URL}/assets`;
const CATEGORIES_URL = `${BASE_URL}/categories`;

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || "API request failed";
    throw new Error(message);
  }
  return data;
};

export const getAssets = async () => {
  const res = await fetch(ASSETS_URL);
  return handleResponse(res);
};

export const getAssetById = async (id) => {
  const res = await fetch(`${ASSETS_URL}/${id}`);
  return handleResponse(res);
};

export const createAsset = async (payload) => {
  const res = await fetch(ASSETS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const updateAsset = async (id, payload) => {
  const res = await fetch(`${ASSETS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const deleteAsset = async (id) => {
  const res = await fetch(`${ASSETS_URL}/${id}`, {
    method: "DELETE"
  });
  return handleResponse(res);
};

export const getAvailableAssets = async () => {
  const res = await fetch(`${ASSETS_URL}/available`);
  return handleResponse(res);
};

export const getAssignedAssets = async () => {
  const res = await fetch(`${ASSETS_URL}/assigned`);
  return handleResponse(res);
};

export const getCategories = async () => {
  const res = await fetch(CATEGORIES_URL);
  return handleResponse(res);
};

export const getCategoryById = async (id) => {
  const res = await fetch(`${CATEGORIES_URL}/${id}`);
  return handleResponse(res);
};

export const createCategory = async (payload) => {
  const res = await fetch(CATEGORIES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const updateCategory = async (id, payload) => {
  const res = await fetch(`${CATEGORIES_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const deleteCategory = async (id) => {
  const res = await fetch(`${CATEGORIES_URL}/${id}`, {
    method: "DELETE"
  });
  return handleResponse(res);
};
