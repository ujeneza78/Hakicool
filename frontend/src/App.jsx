import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;
const emptyForm = { name: "", reference: "", quantity: "", price: "", threshold: "" };
const emptyMove = { productId: "", type: "in", quantity: "", note: "" };

async function request(path, options) {
  const res = await fetch(`${API}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur du serveur");
  return data;
}

function jsonOptions(method, body) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [moveForm, setMoveForm] = useState(emptyMove);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      const [productsData, movementsData] = await Promise.all([
        request("/products"),
        request("/movements"),
      ]);
      setProducts(productsData);
      setMovements(movementsData);
      setError("");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Impossible de joindre l'API. Le serveur est-il lancé ?"
          : err.message
      );
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleMoveChange(event) {
    setMoveForm({ ...moveForm, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await request(
        "/products",
        jsonOptions("POST", {
          ...form,
          quantity: Number(form.quantity),
          price: Number(form.price),
          threshold: Number(form.threshold),
        })
      );
      setForm(emptyForm);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addMovement(productId, type, quantity, note = "") {
    try {
      await request("/movements", jsonOptions("POST", { productId, type, quantity, note }));
      await loadAll();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function handleMoveSubmit(event) {
    event.preventDefault();
    const ok = await addMovement(
      moveForm.productId,
      moveForm.type,
      Number(moveForm.quantity),
      moveForm.note
    );
    if (ok) setMoveForm(emptyMove);
  }

  async function removeProduct(id) {
    try {
      await request(`/products/${id}`, { method: "DELETE" });
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
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
                <button onClick={() => addMovement(p._id, "in", 1)}>+</button>
                <button onClick={() => addMovement(p._id, "out", 1)}>−</button>
                <button onClick={() => removeProduct(p._id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="total">
        Valeur totale du stock : <strong>{total.toFixed(2)}</strong>
      </p>

      <h2>Enregistrer un mouvement</h2>
      <form onSubmit={handleMoveSubmit}>
        <select name="productId" value={moveForm.productId} onChange={handleMoveChange} required>
          <option value="">Choisir un produit</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.reference})
            </option>
          ))}
        </select>
        <select name="type" value={moveForm.type} onChange={handleMoveChange}>
          <option value="in">Entrée</option>
          <option value="out">Sortie</option>
        </select>
        <input name="quantity" type="number" min="1" placeholder="Quantité" value={moveForm.quantity} onChange={handleMoveChange} required />
        <input name="note" placeholder="Note (facultatif)" value={moveForm.note} onChange={handleMoveChange} />
        <button type="submit">Valider</button>
      </form>

      <h2>Historique des mouvements</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Produit</th><th>Type</th><th>Quantité</th><th>Note</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m._id}>
              <td>{new Date(m.createdAt).toLocaleString("fr-FR")}</td>
              <td>{m.productName} ({m.reference})</td>
              <td className={m.type === "in" ? "move-in" : "move-out"}>
                {m.type === "in" ? "Entrée" : "Sortie"}
              </td>
              <td>{m.quantity}</td>
              <td>{m.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}