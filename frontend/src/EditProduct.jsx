import { useEffect, useState } from "react";
import { request, jsonOptions } from "./api";

export default function EditProduct({ product, categories, suppliers, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product.name,
    reference: product.reference,
    category: product.category || "",
    supplier: product.supplier?._id || "",
    price: product.price,
    threshold: product.threshold ?? 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Fournisseurs actifs, plus le fournisseur actuel du produit même s'il est désactivé
  const options = suppliers.filter((s) => s.active || s._id === form.supplier);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await request(
        `/products/${product._id}`,
        jsonOptions("PUT", {
          ...form,
          supplier: form.supplier || null,
          price: Number(form.price),
          threshold: Number(form.threshold),
        })
      );
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="edit-title">Modifier le produit</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label className="field">
            Nom
            <input name="name" type="text" value={form.name} onChange={handleChange} required />
          </label>
          <label className="field">
            Référence
            <input name="reference" type="text" value={form.reference} onChange={handleChange} required />
          </label>
          <label className="field">
            Catégorie
            <input
              name="category"
              type="text"
              list="edit-categories"
              value={form.category}
              onChange={handleChange}
            />
            <datalist id="edit-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="field">
            Fournisseur
            <select name="supplier" value={form.supplier} onChange={handleChange}>
              <option value="">Aucun</option>
              {options.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                  {s.active ? "" : " (inactif)"}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Prix
            <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
          </label>
          <label className="field">
            Seuil d'alerte
            <input name="threshold" type="number" min="0" value={form.threshold} onChange={handleChange} required />
          </label>

          <div className="modal-actions">
            <button type="submit" className="primary">Enregistrer</button>
            <button type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}