const BASE_URL = "http://localhost:5000/api/users";

// GET
export const getUsers = async () => {
  const res = await fetch(BASE_URL);
  return res.json();
};

// CREATE
export const createUser = async (data) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

// UPDATE
export const updateUser = async (id, data) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

// DELETE
export const deleteUser = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  });
  return res.json();
};