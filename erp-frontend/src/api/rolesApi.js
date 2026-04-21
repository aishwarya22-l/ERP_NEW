const BASE_URL = "http://localhost:5000/api/roles";

export const getRoles = async () => {
  const res = await fetch(BASE_URL);
  return res.json();
};

export const getRoleById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  return res.json();
};

export const createRole = async (data) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateRole = async (id, data) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteRole = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  });
  return res.json();
};
