import { useState } from "react";

export default function ReportsPage({ sales, purchases, expenses }) {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  // Filtrer par période
  const filterByDate = (items) => {
    return items.filter(item => {
      const itemDate = new Date(item.date || item.purchaseDate || item.createdAt).toISOString().split("T")[0];
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const filteredSales = filterByDate(sales);
  const filteredPurchases = filterByDate(purchases);
  const filteredExpenses = filterByDate(expenses);

  // Calculs
  const totalSales = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalSales - totalPurchases - totalExpenses;

  return (
    <div className="reports-page">
      <h2>📊 Rapports Financiers</h2>

      {/* Sélecteur de période */}
      <div className="period-selector">
        <label>
          Du:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          Au:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>

      {/* Tableau récapitulatif */}
      <div className="report-summary">
        <table className="summary-table">
          <thead>
            <tr>
              <th>Rubrique</th>
              <th>Montant</th>
              <th>Nombre</th>
              <th>% du total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="sales-row">
              <td><strong>Ventes</strong></td>
              <td className="amount">{totalSales.toFixed(2)} BIF</td>
              <td>{filteredSales.length}</td>
              <td>{totalSales > 0 ? ((totalSales / (totalSales + totalExpenses)) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr className="purchases-row">
              <td><strong>Achats</strong></td>
              <td className="amount">{totalPurchases.toFixed(2)} BIF</td>
              <td>{filteredPurchases.length}</td>
              <td>{totalSales > 0 ? ((totalPurchases / totalSales) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr className="expenses-row">
              <td><strong>Dépenses</strong></td>
              <td className="amount">{totalExpenses.toFixed(2)} BIF</td>
              <td>{filteredExpenses.length}</td>
              <td>{totalSales > 0 ? ((totalExpenses / totalSales) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr className="profit-row">
              <td><strong>Bénéfice</strong></td>
              <td className={`amount ${profit >= 0 ? "positive" : "negative"}`}>
                <strong>{profit.toFixed(2)} BIF</strong>
              </td>
              <td>-</td>
              <td>{totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : 0}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tableau détail des ventes */}
      {filteredSales.length > 0 && (
        <div className="report-details">
          <h3>Détail des ventes ({filteredSales.length})</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Articles</th>
                  <th>Paiement</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale._id}>
                    <td>{new Date(sale.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td>{sale.totalAmount.toFixed(2)} BIF</td>
                    <td>{sale.items.length}</td>
                    <td>{sale.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tableau détail des achats */}
      {filteredPurchases.length > 0 && (
        <div className="report-details">
          <h3>Détail des achats ({filteredPurchases.length})</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Fournisseur</th>
                  <th>Montant</th>
                  <th>Articles</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map(purchase => (
                  <tr key={purchase._id}>
                    <td>{new Date(purchase.purchaseDate).toLocaleDateString("fr-FR")}</td>
                    <td>{purchase.supplierName}</td>
                    <td>{purchase.totalAmount.toFixed(2)} BIF</td>
                    <td>{purchase.items.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tableau détail des dépenses */}
      {filteredExpenses.length > 0 && (
        <div className="report-details">
          <h3>Détail des dépenses ({filteredExpenses.length})</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Catégorie</th>
                  <th>Montant</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(expense => (
                  <tr key={expense._id}>
                    <td>{new Date(expense.date).toLocaleDateString("fr-FR")}</td>
                    <td>{expense.category}</td>
                    <td>{expense.amount.toFixed(2)} BIF</td>
                    <td>{expense.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
