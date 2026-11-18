import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;
const emptyForm = { name: "", reference: "", quantity: "", price: "", threshold: "" };

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/products`);
      setProducts(await res.json());
      setError("");
    } catch {
      setError("Impossible de joindre l'API. Le serveur est-il lancé ?");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const res = await fetch(`${API}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
        price: Number(form.price),
        threshold: Number(form.threshold),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.message);
      return;
    }
    setForm(emptyForm);
    setError("");
    loadProducts();
  }

  async function changeQuantity(product, delta) {
    await fetch(`${API}/products/${product._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: Math.max(0, product.quantity + delta) }),
    });
    loadProducts();
  }

  async function removeProduct(id) {
    await fetch(`${API}/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  const term = search.toLowerCase();
  const visible = products.filter(
    (p) => p.name.toLowerCase().includes(term) || p.reference.toLowerCase().includes(term)
  );
  const total = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  return (
    <main>
      <h1>Gestion de stock</h1>
      {error && <p style={{ color: "#b00020" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nom du produit" value={form.name} onChange={handleChange} required />
        <input name="reference" placeholder="Référence" value={form.reference} onChange={handleChange} required />
        <input name="quantity" type="number" min="0" placeholder="Quantité" value={form.quantity} onChange={handleChange} required />
        <input name="price" type="number" min="0" step="0.01" placeholder="Prix" value={form.price} onChange={handleChange} required />
        <input name="threshold" type="number" min="0" placeholder="Seuil d'alerte" value={form.threshold} onChange={handleChange} required />
        <button type="submit">Ajouter</button>
      </form>

      <input
        id="search"
        type="search"
        placeholder="Rechercher un produit..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Nom</th><th>Référence</th><th>Quantité</th><th>Prix</th><th>Total</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((p) => (
            <tr key={p._id} className={p.quantity <= p.threshold ? "low" : ""}>
              <td>{p.name}</td>
              <td>{p.reference}</td>
              <td>{p.quantity}</td>
              <td>{p.price.toFixed(2)}</td>
              <td>{(p.quantity * p.price).toFixed(2)}</td>
              <td>
                <button onClick={() => changeQuantity(p, 1)}>+</button>
                <button onClick={() => changeQuantity(p, -1)}>−</button>
                <button onClick={() => removeProduct(p._id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="total">
        Valeur totale du stock : <strong>{total.toFixed(2)}</strong>
      </p>
    </main>
  );
}