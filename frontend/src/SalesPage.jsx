import { useState } from "react";

export default function SalesPage({ products, onSale, isAdmin }) {
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const handleAddToCart = (product) => {
    const qty = parseInt(quantities[product._id] || 0);
    if (qty > 0) {
      const existing = cart.find(item => item.productId === product._id);
      
      if (existing) {
        setCart(cart.map(item =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + qty, total: (item.quantity + qty) * item.price }
            : item
        ));
      } else {
        setCart([...cart, {
          productId: product._id,
          name: product.name,
          quantity: qty,
          price: product.price,
          total: qty * product.price,
        }]);
      }
      setQuantities({ ...quantities, [product._id]: 0 });
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

  const handleValidateSale = async () => {
    if (cart.length === 0 || !paymentMethod) {
      alert("Remplir le panier et la méthode de paiement");
      return;
    }

    const payload = {
      items: cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
      paymentMethod,
      notes,
    };

    const success = await onSale(payload);
    if (success) {
      setCart([]);
      setPaymentMethod("cash");
      setNotes("");
      setQuantities({});
    }
  };

  return (
    <div className="sales-page">
      <h2>🛒 Caisse</h2>

      {/* Tableau des produits */}
      <div className="products-section">
        <h3>Produits disponibles</h3>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Quantité</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.price.toFixed(2)} €</td>
                <td>{product.quantity}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max={product.quantity}
                    value={quantities[product._id] || 0}
                    onChange={(e) => setQuantities({ ...quantities, [product._id]: e.target.value })}
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
        <h3>Panier</h3>
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
                    <td>{item.price.toFixed(2)} €</td>
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

      {/* Formulaire de paiement */}
      <div className="payment-section">
        <h3>Paiement</h3>
        <label>
          Méthode de paiement:
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="cash">Espèces</option>
            <option value="card">Carte</option>
            <option value="check">Chèque</option>
          </select>
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
        <button onClick={handleValidateSale} className="btn-primary">
          ✓ Valider la vente
        </button>
      </div>
    </div>
  );
}