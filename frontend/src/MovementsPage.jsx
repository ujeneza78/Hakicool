import { useState } from "react";

const emptyMove = { productId: "", type: "in", quantity: "", note: "" };

export default function MovementsPage({ products, movements, onMove, onExport }) {
  const [moveForm, setMoveForm] = useState(emptyMove);

  function handleChange(event) {
    setMoveForm({ ...moveForm, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const ok = await onMove(
      moveForm.productId,
      moveForm.type,
      Number(moveForm.quantity),
      moveForm.note
    );
    if (ok) setMoveForm(emptyMove);
  }

  return (
    <>
      <h2>Enregistrer un mouvement</h2>
      <form onSubmit={handleSubmit}>
        <select name="productId" value={moveForm.productId} onChange={handleChange} required>
          <option value="">Choisir un produit</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.reference})
            </option>
          ))}
        </select>
        <select name="type" value={moveForm.type} onChange={handleChange}>
          <option value="in">Entrée</option>
          <option value="out">Sortie</option>
        </select>
        <input name="quantity" type="number" min="1" placeholder="Quantité" value={moveForm.quantity} onChange={handleChange} required />
        <input name="note" placeholder="Note (facultatif)" value={moveForm.note} onChange={handleChange} />
        <button type="submit">Valider</button>
      </form>

      <div className="section-head">
        <h2>Historique des mouvements</h2>
        <button onClick={onExport}>⬇ Exporter l'historique (CSV)</button>
      </div>

      <div className="table-scroll">
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
      </div>
    </>
  );
}