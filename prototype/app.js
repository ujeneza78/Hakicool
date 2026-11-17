const products = [];

const form = document.getElementById("product-form");
const list = document.getElementById("product-list");
const search = document.getElementById("search");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);

  products.push({
    id: Date.now(),
    name: data.get("name").trim(),
    reference: data.get("reference").trim(),
    quantity: Number(data.get("quantity")),
    price: Number(data.get("price")),
    threshold: Number(data.get("threshold")),
  });

  form.reset();
  render();
});

search.addEventListener("input", render);

function makeButton(label, onClick) {
  const button = document.createElement("button");
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function changeQuantity(product, delta) {
  product.quantity = Math.max(0, product.quantity + delta);
  render();
}

function removeProduct(id) {
  const index = products.findIndex((p) => p.id === id);
  products.splice(index, 1);
  render();
}

function render() {
  const term = search.value.toLowerCase();
  list.innerHTML = "";

  products
    .filter((p) =>
      p.name.toLowerCase().includes(term) ||
      p.reference.toLowerCase().includes(term)
    )
    .forEach((p) => {
      const row = document.createElement("tr");
      if (p.quantity <= p.threshold) row.classList.add("low");
      // Table cells for product details and total
      [p.name, p.reference, p.quantity, p.price.toFixed(2), (p.quantity * p.price).toFixed(2)].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
        // Update total stock value
        const total = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
        document.getElementById("total").textContent = total.toFixed(2);
      });

      const actions = document.createElement("td");
      actions.append(
        makeButton("+", () => changeQuantity(p, 1)),
        makeButton("−", () => changeQuantity(p, -1)),
        makeButton("Supprimer", () => removeProduct(p.id))
      );
      row.appendChild(actions);

      list.appendChild(row);
    });
}