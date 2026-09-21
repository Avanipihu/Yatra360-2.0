/**
 * Small dependency-free SVG charts for the console.
 *
 * These three shapes are simple enough that hand-drawn SVG keeps the
 * console fast and the visual language identical to the rest of the app.
 */

export function StackedHourlyChart({ series, segments, height = 190 }) {
  if (!series || series.length === 0) return null

  const keys = Object.keys(segments || { family: 1, solo: 1, transit: 1 })
  const max = Math.max(...series.map(r => r.total), 1)
  const width = 100 // percentage-style viewBox, scales with its column
  const step = width / series.length

  return (
    <div className="biz-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Projected hourly arrivals by visitor segment"
      >
        {series.map((row, i) => {
          let y = height
          return (
            <g key={row.hour}>
              {keys.map(key => {
                const value = row[key] || 0
                const h = (value / max) * (height - 16)
                y -= h
                return (
                  <rect
                    key={key}
                    x={i * step + step * 0.12}
                    y={y}
                    width={step * 0.76}
                    height={Math.max(0, h)}
                    fill={segments?.[key]?.hex || '#2C6E63'}
                    opacity="0.92"
                  />
                )
              })}
            </g>
          )
        })}
      </svg>

      <div className="biz-chart-axis">
        {series.filter((_, i) => i % 4 === 0).map(r => (
          <span key={r.hour}>{String(r.hour).padStart(2, '0')}</span>
        ))}
      </div>
    </div>
  )
}

export function CrowdBar({ value, level }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  const tone =
    level === 'Very high' ? 'crowd-vhigh'
      : level === 'High' ? 'crowd-high'
        : level === 'Moderate' ? 'crowd-mod'
          : 'crowd-low'
  return (
    <span className={`biz-bar ${tone}`} role="img" aria-label={`${level}, ${pct} percent`}>
      <i style={{ width: `${pct}%` }} />
    </span>
  )
}

export function Sparkline({ points, height = 46 }) {
  if (!points || points.length === 0) return null
  const max = Math.max(...points, 1)
  const width = 100
  const step = width / Math.max(1, points.length - 1)

  const path = points
    .map((p, i) => {
      const x = (i * step).toFixed(2)
      const y = (height - (p / max) * (height - 8) - 4).toFixed(2)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <svg className="biz-spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke="var(--teal)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function BarRow({ label, value, max, suffix = '' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="biz-barrow">
      <span className="biz-barrow-label">{label}</span>
      <span className="biz-barrow-track"><i style={{ width: `${pct}%` }} /></span>
      <b>{value}{suffix}</b>
    </div>
  )
}
