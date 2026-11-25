import { useEffect, useState } from "react";
import { request, jsonOptions } from "./api";

export default function ShopProfile({ shop, isAdmin, onSaved }) {
  const [form, setForm] = useState(shop);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(shop);
  }, [shop]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const saved = await request("/shop", jsonOptions("PUT", form));
      onSaved(saved);
      setMessage("Profil enregistré");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Profil de la boutique</h2>
      <p className="muted">
        Ces informations s'affichent en haut du menu.
        {!isAdmin && " Seul un administrateur peut les modifier."}
      </p>

      {error && <p className="modal-error">{error}</p>}
      {message && <p className="modal-success">{message}</p>}

      <form className="shop-form" onSubmit={handleSubmit}>
        <label className="field">
          Nom de la boutique
          <input name="name" value={form.name} onChange={handleChange} disabled={!isAdmin} required />
        </label>
        <label className="field">
          Téléphone
          <input name="phone" value={form.phone} onChange={handleChange} disabled={!isAdmin} />
        </label>
        <label className="field">
          Adresse
          <input name="address" value={form.address} onChange={handleChange} disabled={!isAdmin} />
        </label>
        {isAdmin && (
          <button type="submit" className="primary-btn">Enregistrer</button>
        )}
      </form>
    </div>
  );
}