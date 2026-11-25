import { useState } from "react";

const emptyForm = { name: "", reference: "", category: "", quantity: "", price: "", threshold: "" };
const NO_CATEGORY = "__none__";

export default function ProductsPage({
  products,
  categories,
  isAdmin,
  onAdd,
  onMove,
  onEdit,
  onRemove,
  onExport,
}) {
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const ok = await onAdd({
      ...form,
      quantity: Number(form.quantity),
      price: Number(form.price),
      threshold: Number(form.threshold),
    });
    if (ok) setForm(emptyForm);
  }

  const term = search.toLowerCase();
  const visible = products.filter((p) => {
    const matchesText =
      p.name.toLowerCase().includes(term) ||
      p.reference.toLowerCase().includes(term) ||
      (p.category || "").toLowerCase().includes(term);
    const matchesCategory =
      categoryFilter === "" ||
      (categoryFilter === NO_CATEGORY ? !p.category : p.category === categoryFilter);
    return matchesText && matchesCategory;
  });
  const total = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  return (
    <>
      <div className="section-head">
        <h2>Produits</h2>
        <button onClick={onExport}>⬇ Exporter l'inventaire (CSV)</button>
      </div>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nom du produit" value={form.name} onChange={handleChange} required />
        <input name="reference" placeholder="Référence" value={form.reference} onChange={handleChange} required />
        <input name="category" list="categories" placeholder="Catégorie" value={form.category} onChange={handleChange} />
        <datalist id="categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <input name="quantity" type="number" min="0" placeholder="Quantité" value={form.quantity} onChange={handleChange} required />
        <input name="price" type="number" min="0" step="0.01" placeholder="Prix" value={form.price} onChange={handleChange} required />
        <input name="threshold" type="number" min="0" placeholder="Seuil d'alerte" value={form.threshold} onChange={handleChange} required />
        <button type="submit">Ajouter</button>
      </form>

      <div className="toolbar">
        <input
          id="search"
          type="search"
          placeholder="Rechercher (nom, référence, catégorie)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value={NO_CATEGORY}>Sans catégorie</option>
        </select>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Nom</th><th>Référence</th><th>Catégorie</th><th>Quantité</th><th>Prix</th><th>Total</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p._id} className={p.quantity <= p.threshold ? "low" : ""}>
                <td>{p.name}</td>
                <td>{p.reference}</td>
                <td>{p.category || "—"}</td>
                <td>{p.quantity}</td>
                <td>{p.price.toFixed(2)}</td>
                <td>{(p.quantity * p.price).toFixed(2)}</td>
                <td>
                  <button onClick={() => onMove(p._id, "in", 1)}>+</button>
                  <button onClick={() => onMove(p._id, "out", 1)}>−</button>
                  {isAdmin && (
                    <>
                      <button onClick={() => onEdit(p)}>Modifier</button>
                      <button onClick={() => onRemove(p._id)}>Supprimer</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="total">
        Valeur totale du stock : <strong>{total.toFixed(2)}</strong>
      </p>
    </>
  );
}