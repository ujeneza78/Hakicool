import { useState } from "react";

export default function PurchasesPage({ products, suppliers, onPurchase, isAdmin }) {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [costPrices, setCostPrices] = useState({});
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const handleAddToCart = (product) => {
    const qty = parseInt(quantities[product._id] || 0);
    const cost = parseFloat(costPrices[product._id] || 0);

    if (qty > 0 && cost > 0) {
      const existing = cart.find(item => item.productId === product._id);

      if (existing) {
        setCart(cart.map(item =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + qty, total: (item.quantity + qty) * cost }
            : item
        ));
      } else {
        setCart([...cart, {
          productId: product._id,
          name: product.name,
          quantity: qty,
          costPrice: cost,
          total: qty * cost,
        }]);
      }
      setQuantities({ ...quantities, [product._id]: 0 });
      setCostPrices({ ...costPrices, [product._id]: 0 });
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

  const handleValidatePurchase = async () => {
    if (!selectedSupplier || cart.length === 0) {
      alert("Choisir un fournisseur et ajouter au moins un produit");
      return;
    }

    const payload = {
      items: cart.map(item => ({ productId: item.productId, quantity: item.quantity, costPrice: item.costPrice })),
      supplierId: selectedSupplier,
      purchaseDate,
      notes,
    };

    const success = await onPurchase(payload);
    if (success) {
      setCart([]);
      setSelectedSupplier("");
      setPurchaseDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setQuantities({});
      setCostPrices({});
    }
  };

  return (
    <div className="purchases-page">
      <h2>🛒 Achats</h2>

      {/* Sélectionner fournisseur */}
      <div className="supplier-section">
        <h3>Fournisseur</h3>
        <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} required>
          <option value="">Choisir un fournisseur</option>
          {suppliers.map(supplier => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau des produits */}
      <div className="products-section">
        <h3>Produits à acheter</h3>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix unitaire (d'achat)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.name} ({product.reference})</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={quantities[product._id] || 0}
                    onChange={(e) => setQuantities({ ...quantities, [product._id]: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="€"
                    value={costPrices[product._id] || 0}
                    onChange={(e) => setCostPrices({ ...costPrices, [product._id]: e.target.value })}
                  />
                </td>
                <td>
                  <button onClick={() => handleAddToCart(product)}>Ajouter</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Panier */}
      <div className="cart-section">
        <h3>Panier d'achat</h3>
        {cart.length === 0 ? (
          <p>Panier vide</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.costPrice.toFixed(2)} €</td>
                    <td>{item.total.toFixed(2)} €</td>
                    <td>
                      <button onClick={() => handleRemoveFromCart(item.productId)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cart-total">
              <strong>Total: {totalAmount.toFixed(2)} €</strong>
            </div>
          </>
        )}
      </div>

      {/* Informations d'achat */}
      <div className="purchase-info-section">
        <h3>Informations d'achat</h3>
        <label>
          Date de réception:
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </label>
        <label>
          Notes:
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optionnel)"
          />
        </label>
        <button onClick={handleValidatePurchase} className="btn-primary">
          ✓ Valider l'achat
        </button>
      </div>
    </div>
  );
}