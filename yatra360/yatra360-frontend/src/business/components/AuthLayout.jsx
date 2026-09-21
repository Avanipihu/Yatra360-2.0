import { Link } from 'react-router-dom'

/** Form on the left, pitch panel on the right. Stacks under 900px. */
export default function AuthLayout({ title, intro, steps, children, footer }) {
  return (
    <div className="biz-auth">
      <section className="biz-auth-form">
        <Link className="biz-auth-back" to="/">&larr; Back to Yatra360</Link>

        <img src="/yatra360-logo.png" alt="Yatra360" className="biz-auth-logo" />

        <h1>{title}</h1>
        <p className="biz-auth-intro">{intro}</p>

        {steps}
        {children}

        {footer && <p className="biz-auth-foot">{footer}</p>}
      </section>

      <aside className="biz-auth-panel" aria-hidden="true">
        <p className="biz-auth-kicker">WHY LIST WITH US</p>
        <h2>Tourists are already walking past. We tell you when.</h2>

        <ul className="biz-auth-points">
          <li>
            <b>Appear inside itineraries</b>
            Not buried under five-star chains &mdash; local, owner-run listings show first.
          </li>
          <li>
            <b>See the crowd before it arrives</b>
            Live crowd levels at every attraction inside your radius.
          </li>
          <li>
            <b>Get told what to do about it</b>
            Plain-language prompts, each traced back to the signal behind it.
          </li>
          <li>
            <b>Know your own numbers</b>
            Profile views, where they came from, and your peak demand window.
          </li>
        </ul>

        <div className="biz-auth-panel-foot">
          PUNE PROTOTYPE &middot; ESTIMATED DEMAND, NOT LIVE TRACKING
        </div>
      </aside>
    </div>
  )
}
