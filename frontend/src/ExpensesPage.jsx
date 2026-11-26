import { useState } from "react";

export default function ExpensesPage({ expenses, onAdd, onRemove, isAdmin }) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount) {
      alert("Remplir catégorie et montant");
      return;
    }

    const payload = {
      category,
      amount: parseFloat(amount),
      description,
      date,
    };

    const success = await onAdd(payload);
    if (success) {
      setCategory("");
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="expenses-page">
      <h2>💸 Dépenses</h2>

      {/* Formulaire d'ajout */}
      <div className="form-section">
        <h3>Enregistrer une dépense</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Catégorie (Loyer, Transport, Électricité...)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Montant BIF"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            required
          />
          <input
            type="text"
            placeholder="Description (optionnel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button type="submit">Enregistrer</button>
        </form>
      </div>

      {/* Tableau des dépenses */}
      <div className="expenses-list">
        <h3>Historique des dépenses</h3>
        {expenses.length === 0 ? (
          <p>Aucune dépense enregistrée</p>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Catégorie</th>
                    <th>Montant</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <tr key={expense._id}>
                      <td>{new Date(expense.date).toLocaleDateString("fr-FR")}</td>
                      <td>{expense.category}</td>
                      <td>{expense.amount.toFixed(2)} BIF</td>
                      <td>{expense.description || "-"}</td>
                      <td>
                        {isAdmin && (
                          <button onClick={() => onRemove(expense._id)}>Supprimer</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="expenses-total">
              <strong>Total des dépenses: {totalExpenses.toFixed(2)} BIF</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}