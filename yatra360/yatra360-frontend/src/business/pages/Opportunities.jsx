import { useDashboard } from '../useDashboard'
import OpportunityCard from '../components/OpportunityCard'

export default function Opportunities() {
  const { data, error, isLoading, actOnOpportunity, clearOpportunity } = useDashboard()

  if (isLoading && !data) return <div className="biz-boot">Loading your prompts&hellip;</div>
  if (error && !data) {
    return (
      <div className="biz-boot biz-boot-error">
        <h2>Couldn't load your opportunities</h2>
        <p>{error}</p>
      </div>
    )
  }

  const { opportunities, alerts } = data
  const inPlan = opportunities.filter(o => o.status === 'accepted').length
  const open = opportunities.filter(o => !o.status)

  return (
    <div className="biz-page">
      <header className="biz-page-head">
        <div>
          <h1>Opportunity alerts</h1>
          <p>
            Actionable prompts rather than raw numbers. Every one names the signal behind
            it, so you can disagree with it.
          </p>
        </div>
        <span className="biz-label">
          {open.length} OPEN &middot; {inPlan} IN YOUR PLAN
        </span>
      </header>

      <section className="biz-mod">
        <div className="biz-mod-head">
          <h3>What changed</h3>
          <span className="biz-label">LIVE FEED</span>
        </div>
        <div className="biz-alert-strip">
          {alerts.map((a, i) => (
            <div className={`biz-alert-chip biz-alert-chip-${a.severity}`} key={`${a.title}-${i}`}>
              <b>{a.title}</b>
              <span>{a.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="biz-opp-list">
        {opportunities.map(o => (
          <OpportunityCard
            key={o.id}
            opportunity={o}
            onAct={actOnOpportunity}
            onClear={clearOpportunity}
          />
        ))}
      </div>
    </div>
  )
}
