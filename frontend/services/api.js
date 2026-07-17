import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp est en secondes (JWT standard), Date.now() est en millisecondes
    return payload.exp * 1000 < Date.now();
  } catch {
    // Si le token est malformé/illisible, on le considère invalide
    return true;
  }
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      if (isTokenExpired(token)) {
        // Token périmé : on nettoie le localStorage et on n'ajoute pas le header
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-changed"));
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }

  return config;
});

// Filet de sécurité : si un 401 arrive quand même (token révoqué côté serveur,
// désynchronisation d'horloge, etc.), on nettoie aussi après coup
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-changed"));
    }
    return Promise.reject(error);
  }
);

export default api;