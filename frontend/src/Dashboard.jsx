import { useEffect, useState } from "react";
import { request } from "./api";

const money = (n) =>
  Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const shortDay = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

function MovementsChart({ days }) {
  const W = 560;
  const H = 230;
  const left = 38;
  const top = 12;
  const bottom = 30;
  const max = Math.max(1, ...days.flatMap((d) => [d.in, d.out]));
  const chartH = H - top - bottom;
  const groupW = (W - left) / days.length;
  const barW = Math.min(22, groupW / 3);
  const y = (value) => top + chartH - (value / max) * chartH;
  const ticks = [...new Set([0, Math.round(max / 2), max])];

  return (
    <svg
      className="chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Entrées et sorties des 7 derniers jours"
    >
      {ticks.map((tick) => (
        <g key={tick}>
          <line className="grid-line" x1={left} x2={W} y1={y(tick)} y2={y(tick)} />
          <text className="axis-text" x={left - 6} y={y(tick) + 4} textAnchor="end">
            {tick}
          </text>
        </g>
      ))}

      {days.map((d, i) => {
        const cx = left + groupW * i + groupW / 2;
        return (
          <g key={d.date}>
            <rect
              className="bar-in"
              x={cx - barW - 1}
              y={y(d.in)}
              width={barW}
              height={top + chartH - y(d.in)}
              rx="3"
            >
              <title>{`${shortDay(d.date)} : ${d.in} entrée(s)`}</title>
            </rect>
            <rect
              className="bar-out"
              x={cx + 1}
              y={y(d.out)}
              width={barW}
              height={top + chartH - y(d.out)}
              rx="3"
            >
              <title>{`${shortDay(d.date)} : ${d.out} sortie(s)`}</title>
            </rect>
            <text className="axis-text" x={cx} y={H - 10} textAnchor="middle">
              {shortDay(d.date)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Dashboard({ refresh }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    request("/stats")
      .then((data) => {
        setStats(data);
        setError("");
      })
      .catch((err) => setError(err.message));
  }, [refresh]);

  if (error) return <p className="dash-empty">Tableau de bord indisponible : {error}</p>;
  if (!stats) return <p className="dash-empty">Chargement du tableau de bord...</p>;

  const noMovements = stats.daily.every((d) => d.in === 0 && d.out === 0);

  return (
    <section className="dashboard">
      <div className="kpis">
        <div className="kpi">
          <span>Produits</span>
          <strong>{stats.products}</strong>
        </div>
        <div className="kpi">
          <span>Unités en stock</span>
          <strong>{stats.units}</strong>
        </div>
        <div className="kpi value">
          <span>Valeur totale du stock</span>
          <strong>{money(stats.value)}</strong>
        </div>
        <div className={`kpi ${stats.lowStockCount > 0 ? "alert" : ""}`}>
          <span>Produits en alerte</span>
          <strong>{stats.lowStockCount}</strong>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-panel">
          <h3>Mouvements des 7 derniers jours</h3>
          <MovementsChart days={stats.daily} />
          <div className="chart-legend">
            <span><i className="dot in" />Entrées</span>
            <span><i className="dot out" />Sorties</span>
          </div>
          {noMovements && <p className="dash-empty">Aucun mouvement sur cette période.</p>}
        </div>

        <div className="dash-side">
          <div className="dash-panel">
            <h3>Produits en alerte</h3>
            {stats.lowStock.length === 0 ? (
              <p className="dash-empty">✅ Aucun produit en alerte.</p>
            ) : (
              <ul className="dash-list">
                {stats.lowStock.map((p) => (
                  <li key={p._id}>
                    <span>{p.name}</span>
                    <strong className="move-out">
                      {p.quantity} / {p.threshold}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
            {stats.lowStockCount > stats.lowStock.length && (
              <p className="dash-empty">
                + {stats.lowStockCount - stats.lowStock.length} autre(s) produit(s)
              </p>
            )}
          </div>

          <div className="dash-panel">
            <h3>Derniers mouvements</h3>
            {stats.recentMovements.length === 0 ? (
              <p className="dash-empty">Aucun mouvement enregistré.</p>
            ) : (
              <ul className="dash-list">
                {stats.recentMovements.map((m) => (
                  <li key={m._id} title={new Date(m.createdAt).toLocaleString("fr-FR")}>
                    <span>
                      {m.type === "in" ? "Entrée" : "Sortie"} · {m.productName}
                    </span>
                    <strong className={m.type === "in" ? "move-in" : "move-out"}>
                      {m.type === "in" ? "+" : "−"}
                      {m.quantity}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}