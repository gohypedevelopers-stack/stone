const LIVE_URL = "https://stone-backend.vercel.app";
const LOCAL_URL = "http://localhost:5000";

export const SERVER_URL = import.meta.env.VITE_APP_API_URL || (import.meta.env.DEV ? LOCAL_URL : LIVE_URL);
export const API_URL = `${SERVER_URL}/api`;

const parseResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON but received ${contentType || "non-JSON"} response`);
  }
};

export const fetchJson = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await parseResponseBody(response);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};
