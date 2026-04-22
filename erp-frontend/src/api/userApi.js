const BASE_URL = "http://localhost:5000/api/employees";

export const getUsers = async (page = 1, pageSize = 10) => {
  const res = await fetch(`${BASE_URL}?page=${page}&pageSize=${pageSize}`);
  return res.json();
};

export const createUser = async (data) => {
  await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
};

export const updateUser = async (id, data) => {
  await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
};

export const deleteUser = async (id) => {
  await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  });
};