import { useState } from "react";

const emptyForm = { name: "", phone: "", email: "", address: "", notes: "" };

export default function CustomersPage({ customers, isAdmin, onSave, onRemove }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function startEdit(customer) {
    setEditingId(customer._id);
    setForm({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      notes: customer.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const ok = await onSave(form, editingId);
    if (ok) cancelEdit();
  }

  function handleRemove(customer) {
    if (window.confirm(`Supprimer le client « ${customer.name} » ?`)) {
      onRemove(customer._id);
    }
  }

  const term = search.toLowerCase();
  const visible = customers.filter(
    (s) =>
      s.name.toLowerCase().includes(term) ||
      (s.phone || "").toLowerCase().includes(term) ||
      (s.email || "").toLowerCase().includes(term) ||
      (s.address || "").toLowerCase().includes(term)
  );

  return (
    <>
      <h2>{editingId ? "Modifier le client" : "Clients"}</h2>

      {isAdmin ? (
        <form className="customer-form" onSubmit={handleSubmit}>
          <input name="name" placeholder="Nom du client" value={form.name} onChange={handleChange} required />
          <input name="phone" placeholder="Téléphone" value={form.phone} onChange={handleChange} />
          <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} />
          <input name="address" placeholder="Adresse" value={form.address} onChange={handleChange} />
          <input name="notes" placeholder="Notes (facultatif)" value={form.notes} onChange={handleChange} />
          <button type="submit">{editingId ? "Enregistrer" : "Ajouter"}</button>
          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Annuler
            </button>
          )}
        </form>
      ) : (
        <p className="muted">Seul un administrateur peut ajouter ou modifier les clients.</p>
      )}

      <div className="toolbar">
        <input
          id="search"
          type="search"
          placeholder="Rechercher (nom, téléphone, e-mail, adresse)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>E-mail</th>
              <th>Adresse</th>
              <th>État</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s._id} className={s.active ? "" : "inactive"} title={s.notes || ""}>
                <td>{s.name}</td>
                <td>{s.phone || "—"}</td>
                <td>{s.email || "—"}</td>
                <td>{s.address || "—"}</td>
                <td className={s.active ? "status-on" : "status-off"}>
                  {s.active ? "Actif" : "Inactif"}
                </td>
                {isAdmin && (
                  <td>
                    <button onClick={() => startEdit(s)}>Modifier</button>
                    <button onClick={() => onSave({ active: !s.active }, s._id)}>
                      {s.active ? "Désactiver" : "Activer"}
                    </button>
                    <button onClick={() => handleRemove(s)}>Supprimer</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <p className="muted">
          {customers.length === 0
            ? "Aucun client enregistré pour le moment."
            : "Aucun client ne correspond à la recherche."}
        </p>
      )}
    </>
  );
}