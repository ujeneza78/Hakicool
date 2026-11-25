const API = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "stock_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && token) {
    clearToken();
    window.dispatchEvent(new Event("auth-expired"));
  }

  if (!res.ok) throw new Error(data.message || "Erreur du serveur");
  return data;
}

export function jsonOptions(method, body) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// Télécharge un fichier protégé par le jeton (par exemple un export CSV)
export async function downloadFile(path, filename) {
  const token = getToken();

  const res = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (res.status === 401 && token) {
    clearToken();
    window.dispatchEvent(new Event("auth-expired"));
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Export impossible");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}