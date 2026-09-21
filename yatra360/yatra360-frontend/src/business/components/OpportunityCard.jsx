const URGENCY_LABEL = { high: 'Act now', medium: 'Today', low: 'This week' }

export default function OpportunityCard({ opportunity, onAct, onClear }) {
  const { id, title, window: slot, confidence, body, signal, urgency, status } = opportunity

  return (
    <article className={`biz-opp biz-opp-${urgency}`}>
      <header className="biz-opp-head">
        <span className={`biz-opp-urgency biz-opp-urgency-${urgency}`}>
          {URGENCY_LABEL[urgency] || 'Suggested'}
        </span>
        <h3>{title}</h3>
      </header>

      <div className="biz-opp-meta">
        <span><b>Window</b> {slot}</span>
        <span><b>Confidence</b> {confidence}%</span>
      </div>

      <p className="biz-opp-body">{body}</p>
      <p className="biz-opp-signal">{signal}</p>

      <div className="biz-opp-actions">
        {status === 'accepted' ? (
          <>
            <span className="biz-opp-state">In your plan</span>
            <button className="biz-btn biz-btn-ghost" onClick={() => onClear(id)}>Remove</button>
          </>
        ) : status === 'dismissed' ? (
          <>
            <span className="biz-opp-state biz-opp-state-off">Dismissed</span>
            <button className="biz-btn biz-btn-ghost" onClick={() => onClear(id)}>Undo</button>
          </>
        ) : (
          <>
            <button className="biz-btn biz-btn-primary" onClick={() => onAct(id, 'accept')}>
              Add to my plan
            </button>
            <button className="biz-btn biz-btn-ghost" onClick={() => onAct(id, 'dismiss')}>
              Not useful
            </button>
          </>
        )}
      </div>
    </article>
  )
}
