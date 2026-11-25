import { useEffect, useState } from "react";
import { request, jsonOptions } from "./api";

export default function Login({ onAuth }) {
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    request("/auth/status")
      .then((data) => setRegistrationOpen(data.registrationOpen))
      .catch(() => setError("Impossible de joindre l'API. Le serveur est-il lancé ?"));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const path = registrationOpen ? "/auth/register" : "/auth/login";
      const data = await request(path, jsonOptions("POST", form));
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">👦</div>
        <h1>Gestion de stock</h1>
        <p className="login-subtitle">
          {registrationOpen
            ? "Créez le compte administrateur"
            : "Connectez-vous pour continuer"}
        </p>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          {registrationOpen && (
            <label>
              Nom
              <input
                name="name"
                placeholder="Votre nom"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
          )}

          <label>
            E-mail
            <input
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Mot de passe
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="8 caractères minimum"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Afficher le mot de passe
          </label>

          <button type="submit" disabled={loading}>
            {loading
              ? "Veuillez patienter..."
              : registrationOpen
              ? "Créer le compte"
              : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}