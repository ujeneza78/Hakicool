import { useEffect, useState } from "react";
import { request, jsonOptions } from "./api";

const empty = { currentPassword: "", newPassword: "", confirm: "" };

export default function ChangePassword({ onClose }) {
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.newPassword !== form.confirm) {
      setError("Les deux nouveaux mots de passe sont différents");
      return;
    }

    try {
      await request(
        "/auth/password",
        jsonOptions("PUT", {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        })
      );
      setMessage("Mot de passe modifié avec succès");
      setForm(empty);
    } catch (err) {
      setError(err.message);
    }
  }

  const type = show ? "text" : "password";

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="password-title">Changer le mot de passe</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        {error && <p className="modal-error">{error}</p>}
        {message && <p className="modal-success">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="currentPassword"
            type={type}
            placeholder="Mot de passe actuel"
            value={form.currentPassword}
            onChange={handleChange}
            autoFocus
            required
          />
          <input
            name="newPassword"
            type={type}
            placeholder="Nouveau mot de passe (8 caractères minimum)"
            value={form.newPassword}
            onChange={handleChange}
            minLength={8}
            required
          />
          <input
            name="confirm"
            type={type}
            placeholder="Confirmer le nouveau mot de passe"
            value={form.confirm}
            onChange={handleChange}
            required
          />

          <label className="modal-check">
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
            Afficher les mots de passe
          </label>

          <div className="modal-actions">
            <button type="submit" className="primary">Enregistrer</button>
            <button type="button" onClick={onClose}>Fermer</button>
          </div>
        </form>
      </div>
    </div>
  );
}