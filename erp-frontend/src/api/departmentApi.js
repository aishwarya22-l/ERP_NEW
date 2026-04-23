const BASE_URL = "http://localhost:5000/api";
const DEPARTMENTS_URL = `${BASE_URL}/departments`;

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || "API request failed";
    throw new Error(message);
  }
  return data;
};

export const getDepartments = async () => {
  const res = await fetch(DEPARTMENTS_URL);
  return handleResponse(res);
};

export const getDepartmentById = async (id) => {
  const res = await fetch(`${DEPARTMENTS_URL}/${id}`);
  return handleResponse(res);
};

export const createDepartment = async (payload) => {
  const res = await fetch(DEPARTMENTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const updateDepartment = async (id, payload) => {
  const res = await fetch(`${DEPARTMENTS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const deleteDepartment = async (id) => {
  const res = await fetch(`${DEPARTMENTS_URL}/${id}`, {
    method: "DELETE"
  });
  return handleResponse(res);
};
