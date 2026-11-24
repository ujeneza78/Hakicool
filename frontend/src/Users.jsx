import { useEffect, useState } from "react";
import { request, jsonOptions } from "./api";

const emptyForm = { name: "", email: "", password: "", role: "user" };

export default function Users({ currentEmail, onClose }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [show, setShow] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setUsers(await request("/users"));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function run(action, successText) {
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(successText);
      await load();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleCreate(event) {
    event.preventDefault();
    const ok = await run(() => request("/users", jsonOptions("POST", form)), "Compte créé");
    if (ok) setForm(emptyForm);
  }

  function updateUser(user, changes) {
    return run(
      () => request(`/users/${user._id}`, jsonOptions("PUT", changes)),
      "Compte mis à jour"
    );
  }

  async function handleReset(event) {
    event.preventDefault();
    const ok = await run(
      () =>
        request(`/users/${resetUser._id}/password`, jsonOptions("PUT", { newPassword })),
      "Mot de passe réinitialisé"
    );
    if (ok) {
      setResetUser(null);
      setNewPassword("");
    }
  }

  const type = show ? "text" : "password";

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="users-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="users-title">Gestion des utilisateurs</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        {error && <p className="modal-error">{error}</p>}
        {message && <p className="modal-success">{message}</p>}

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>État</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.email === currentEmail;
                const inactive = u.active === false;
                return (
                  <tr key={u._id} className={inactive ? "inactive" : ""}>
                    <td>
                      {u.name}
                      {isMe && " (vous)"}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        disabled={isMe}
                        onChange={(e) => updateUser(u, { role: e.target.value })}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </td>
                    <td>{inactive ? "Désactivé" : "Actif"}</td>
                    <td>
                      <button disabled={isMe} onClick={() => updateUser(u, { active: inactive })}>
                        {inactive ? "Activer" : "Désactiver"}
                      </button>
                      <button
                        onClick={() => {
                          setResetUser(u);
                          setNewPassword("");
                        }}
                      >
                        Mot de passe
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {resetUser && (
          <form className="reset-box" onSubmit={handleReset}>
            <strong>Nouveau mot de passe pour {resetUser.name}</strong>
            <input
              type={type}
              placeholder="8 caractères minimum"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              autoFocus
              required
            />
            <div className="modal-actions">
              <button type="submit" className="primary">Valider</button>
              <button type="button" onClick={() => setResetUser(null)}>Annuler</button>
            </div>
          </form>
        )}

        <h3>Créer un compte</h3>
        <form className="user-form" onSubmit={handleCreate}>
          <input name="name" placeholder="Nom" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
          <input
            name="password"
            type={type}
            placeholder="Mot de passe (8 caractères minimum)"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
          <button type="submit" className="primary-btn">Créer</button>
        </form>

        <label className="modal-check">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
          Afficher les mots de passe
        </label>
      </div>
    </div>
  );
}