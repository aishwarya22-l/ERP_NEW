const BASE_URL = "http://localhost:5000/api";

export const apiRequest = async (path, method = "GET", data = null) => {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
  };

  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.message || "API request failed";
    throw new Error(message);
  }

  return body;
};
