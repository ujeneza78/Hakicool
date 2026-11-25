export default function ComingSoon({ item }) {
  return (
    <div className="card coming">
      <div className="coming-icon">{item.icon}</div>
      <h2>{item.label}</h2>
      <p>{item.desc}</p>
      <span className="soon-badge big">Bientôt disponible</span>
    </div>
  );
}