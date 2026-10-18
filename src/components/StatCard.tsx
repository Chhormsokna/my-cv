export default function StatCard({ label, value, icon, tone, detail }: { label: string; value: number; icon: string; tone: string; detail: string }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><i className={`bi bi-${icon}`} /></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}
