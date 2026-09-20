export default function VerifiedBadge({ source, lastVerified }) {
  return (
    <div className="verified-badge">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Verified &middot; {source} &middot; checked {lastVerified}</span>
    </div>
  )
}
