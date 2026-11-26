import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";

export const MENU = [
  { id: "dashboard", icon: "📊", label: "Tableau de bord" },
  {
    id: "sales",
    icon: "🛒",
    label: "Ventes (caisse)",
    desc: "Enregistrer une vente, retirer automatiquement les produits du stock et imprimer un reçu.",
  },
  {
    id: "purchases",
    icon: "📥",
    label: "Achats",
    desc: "Enregistrer les achats auprès des fournisseurs et ajouter les produits reçus au stock.",
  },
  { id: "products", icon: "📦", label: "Produits & catégories" },
  { id: "movements", icon: "🔄", label: "Mouvements de stock" },
  {
    id: "customers",
    icon: "👤",
    label: "Clients",
    desc: "Gérer la liste des clients et suivre leurs achats.",
  },
  { id: "suppliers", icon: "🚚", label: "Fournisseurs" },
  {
    id: "expenses",
    icon: "💸",
    label: "Dépenses",
    desc: "Suivre les dépenses de la boutique : loyer, transport, électricité...",
  },
  {
    id: "reports",
    icon: "📈",
    label: "Rapports",
    soon: true,
    desc: "Consulter les ventes, les achats et les bénéfices par période.",
  },
];

export default function Layout({
  shop,
  page,
  user,
  onChangePassword,
  onManageUsers,
  onLogout,
  children,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const close = () => setOpen(false);
  const title =
    page === "shop" ? "Profil de la boutique" : MENU.find((i) => i.id === page)?.label || "";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-head">
          <div className="shop-logo">🏪</div>
          <div className="shop-name">{shop.name}</div>
          <div className="shop-sub">{shop.phone || user.email}</div>
        </div>

        <nav>
          {MENU.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={close}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.soon && <span className="soon-badge">Bientôt</span>}
            </a>
          ))}

          <div className="nav-sep" />

          {onManageUsers && (
            <button
              type="button"
              className="nav-item"
              onClick={() => {
                close();
                onManageUsers();
              }}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-label">Utilisateurs</span>
            </button>
          )}

          <a
            href="#shop"
            className={`nav-item ${page === "shop" ? "active" : ""}`}
            onClick={close}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Profil de la boutique</span>
          </a>
        </nav>
      </aside>

      {open && <div className="sidebar-overlay" onClick={close} />}

      <div className="content">
        <header className="app-topbar">
          <button
            type="button"
            className="burger"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
          >
            ☰
          </button>
          <div className="page-title">{title}</div>
          <UserMenu
            user={user}
            onChangePassword={onChangePassword}
            onManageUsers={onManageUsers}
            onLogout={onLogout}
          />
        </header>

        <div className="page">{children}</div>
      </div>
    </div>
  );
}