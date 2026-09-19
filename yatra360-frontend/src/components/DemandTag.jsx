const LEVELS = {
  Low: { className: 'demand-low', label: 'Low estimated demand' },
  Moderate: { className: 'demand-moderate', label: 'Moderate estimated demand' },
  High: { className: 'demand-high', label: 'High estimated demand' }
}

export default function DemandTag({ level }) {
  const cfg = LEVELS[level] || LEVELS.Moderate
  return <span className={`demand-tag ${cfg.className}`}>{cfg.label}</span>
}
