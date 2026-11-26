import { useEffect, useState } from "react";
import "./App.css";
import { request, jsonOptions, downloadFile } from "./api";
import Layout, { MENU } from "./Layout";
import ChangePassword from "./ChangePassword";
import Dashboard from "./Dashboard";
import Users from "./Users";
import EditProduct from "./EditProduct";
import ProductsPage from "./ProductsPage";
import MovementsPage from "./MovementsPage";
import SuppliersPage from "./SuppliersPage";
import ShopProfile from "./ShopProfile";
import ComingSoon from "./ComingSoon";
import CustomersPage from "./CustomersPage";
import SalesPage from "./SalesPage";
import PurchasesPage from "./PurchasesPage";
import ExpensesPage from "./ExpensesPage";
import ReportsPage from "./ReportsPage";
          
const PAGES = [...MENU.map((item) => item.id), "shop"];

function readPage() {
  const id = window.location.hash.replace("#", "");
  return PAGES.includes(id) ? id : "dashboard";
}

export default function Stock({ user, onLogout }) {
  const [page, setPage] = useState(readPage);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);  // ← À ajouter
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [shop, setShop] = useState({ name: "Ma boutique", phone: "", address: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [editing, setEditing] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [expenses, setExpenses] = useState([]); 
  const isAdmin = user.role === "admin";

  function showError(err) {
    setError(
      err.message === "Failed to fetch"
        ? "Impossible de joindre l'API. Le serveur est-il lancé ?"
        : err.message
    );
  }

  async function run(action) {
    try {
      await action();
      setError("");
      return true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function loadAll() {
    const [productsData, movementsData, suppliersData, customersData, salesData, purchasesData, expensesData] = await Promise.all([
      request("/products"),
      request("/movements"),
      request("/suppliers"),
      request("/customers"),
      request("/sales"),
      request("/purchases"),
      request("/expenses"),
    ]);
    setProducts(productsData);
    setMovements(movementsData);
    setSuppliers(suppliersData);
    setCustomers(customersData);
    setSales(salesData);
    setPurchases(purchasesData);
    setExpenses(expensesData);
    setRefresh((n) => n + 1);
  }

  useEffect(() => {
    run(loadAll);
    request("/shop")
      .then(setShop)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onHash = () => {
      setPage(readPage());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const addProduct = (payload) =>
    run(async () => {
      await request("/products", jsonOptions("POST", payload));
      await loadAll();
    });

  const addMovement = (productId, type, quantity, note = "") =>
    run(async () => {
      await request("/movements", jsonOptions("POST", { productId, type, quantity, note }));
      await loadAll();
    });

  const removeProduct = (id) =>
    run(async () => {
      await request(`/products/${id}`, { method: "DELETE" });
      await loadAll();
    });

  const saveSupplier = (payload, id) =>
    run(async () => {
      await request(
        id ? `/suppliers/${id}` : "/suppliers",
        jsonOptions(id ? "PUT" : "POST", payload)
      );
      await loadAll();
    });
    const addSale = (payload) =>
      run(async () => {
        await request("/sales", jsonOptions("POST", payload));
        await loadAll();
      });

  const saveCustomer = (payload, id) =>
    run(async () => {
      await request(
        id ? `/customers/${id}` : "/customers",
        jsonOptions(id ? "PUT" : "POST", payload)
      );
      await loadAll();
    });
  
  const addPurchase = (payload) =>
    run(async () => {
      await request("/purchases", jsonOptions("POST", payload));
      await loadAll();
    }); 
  const removeCustomer = (id) =>
    run(async () => {
      await request(`/customers/${id}`, { method: "DELETE" });
      await loadAll();
    });

  const removeSupplier = (id) =>
    run(async () => {
      await request(`/suppliers/${id}`, { method: "DELETE" });
      await loadAll();
    });
    const addExpense = (payload) =>
      run(async () => {
        await request("/expenses", jsonOptions("POST", payload));
        await loadAll();
      });
  const removeExpense = (id) =>
    run(async () => {
      await request(`/expenses/${id}`, { method: "DELETE" });
      await loadAll();
    });

  const exportCsv = (path, name) =>
    run(() => downloadFile(path, `${name}-${new Date().toISOString().slice(0, 10)}.csv`));

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "fr")
  );

  const current = MENU.find((item) => item.id === page);
  let content;

  if (page === "products") {
    content = (
      <ProductsPage
        products={products}
        categories={categories}
        suppliers={suppliers}
        isAdmin={isAdmin}
        onAdd={addProduct}
        onMove={addMovement}
        onEdit={setEditing}
        onRemove={removeProduct}
        onExport={() => exportCsv("/export/products.csv", "inventaire")}
      />
    );
  } else if (page === "customers") {
    content = (
      <CustomersPage
        customers={customers}
        isAdmin={isAdmin}
        onSave={saveCustomer}
        onRemove={removeCustomer}
      />
    );
  } else if (page === "sales") {
    content = (
      <SalesPage
        sales={sales}
        products={products}
        onSale={addSale}
        isAdmin={isAdmin}
      />
    );
  } else if (page === "movements") {
    content = (
      <MovementsPage
        products={products}
        movements={movements}
        onMove={addMovement}
        onExport={() => exportCsv("/export/movements.csv", "mouvements")}
      />
    );
  } else if (page === "suppliers") {
    content = (
      <SuppliersPage
        suppliers={suppliers}
        isAdmin={isAdmin}
        onSave={saveSupplier}
        onRemove={removeSupplier}
      />
    );
  } else if (page === "purchases") {
    content = (
      <PurchasesPage
        products={products}
        suppliers={suppliers}
        onPurchase={addPurchase}
        isAdmin={isAdmin}
      />
    );
  } else if (page === "shop") {
    content = <ShopProfile shop={shop} isAdmin={isAdmin} onSaved={setShop} />;
  } else if (page === "expenses") {
    content = (
      <ExpensesPage
        expenses={expenses}
        onAdd={addExpense}
        onRemove={removeExpense}
        isAdmin={isAdmin}
      />
    
    );
  } else if (page === "reports") {
    content = (
      <ReportsPage
        sales={sales}
        purchases={purchases}
        expenses={expenses}
      />
    );
  } else if (current?.soon) {
    content = <ComingSoon item={current} />;
  } else {
    content = <Dashboard refresh={refresh} />;
  }

  return (
    <>
      <Layout
        shop={shop}
        page={page}
        user={user}
        onChangePassword={() => setShowPassword(true)}
        onManageUsers={isAdmin ? () => setShowUsers(true) : undefined}
        onLogout={onLogout}
      >
        {error && <p className="page-error">{error}</p>}
        {content}
      </Layout>

      {showPassword && <ChangePassword onClose={() => setShowPassword(false)} />}
      {showUsers && <Users currentEmail={user.email} onClose={() => setShowUsers(false)} />}
      {editing && (
        <EditProduct
          product={editing}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            run(loadAll);
          }}
        />
      )}
    </>
  );
}