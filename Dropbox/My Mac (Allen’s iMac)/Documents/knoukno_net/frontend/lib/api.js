const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001/api";

export async function apiRequest(path, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("knoukno_token") : null;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export { API_BASE };
