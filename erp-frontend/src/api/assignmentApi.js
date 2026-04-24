const BASE_URL = "http://localhost:5000/api/assignments";

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || "API request failed";
    throw new Error(message);
  }
  return data;
};

export const getAssignments = async () => {
  const res = await fetch(BASE_URL);
  return handleResponse(res);
};

export const getAssignmentById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  return handleResponse(res);
};

export const getUsersByDepartment = async (department) => {
  const res = await fetch(`${BASE_URL}/users/${department}`);
  return handleResponse(res);
};

export const createAssignment = async (payload) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const updateAssignment = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const deleteAssignment = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  });
  return handleResponse(res);
};
