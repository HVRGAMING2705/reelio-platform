const API_URL = "http://localhost:8080/api";

async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || "Something went wrong");
  }

  return data;
}

// AUTH
export const register = (payload) =>
  api("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const login = (payload) =>
  api("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getMe = () => api("/auth/me");

export const logout = () =>
  api("/auth/logout", {
    method: "POST",
  });

// PROJECTS
export const getMyProjects = () => api("/projects");

export const createProject = (payload) =>
  api("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// PORTFOLIO
export const getPublicPortfolio = () => api("/portfolio");

export const getMyPortfolio = () => api("/portfolio/mine");

export const createPortfolio = (payload) =>
  api("/portfolio", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updatePortfolio = (id, payload) =>
  api(`/portfolio/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deletePortfolio = (id) =>
  api(`/portfolio/${id}`, {
    method: "DELETE",
  });