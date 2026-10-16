import { Link } from "../lib/router";

const QUESTIONS = [
  {
    q: "What do I enter?",
    a: "Length overall, area category, vessel type, hull material, and passenger count. You enter them once. Later questions use that boat.",
  },
  {
    q: "Which codes can I ask about?",
    a: "MCA Sport or Pleasure Vessel Code 2025 and MCA Workboat Code Edition 3. One question can use both.",
  },
  {
    q: "What does an answer include?",
    a: "The result for your boat, the clause number, the page, and the Code’s own words.",
  },
  {
    q: "What if the answer is not in the Code?",
    a: "Regulations says so, and names the Merchant Shipping Regulations, the ISO or BSI standard, or the Certifying Authority.",
  },
  {
    q: "Who uses it?",
    a: "Naval architects, marine surveyors, compliance consultants, and Certifying Authorities.",
  },
  {
    q: "What is 13 December 2026?",
    a: "Workboat Code Edition 3 came into force on 13 December 2023. Boats certificated under the Brown Code, the MGN 280(M) technical annex, or Workboat Code Edition 2 Amendment 1 must meet Edition 3 by their next renewal examination or by 13 December 2026.",
  },
];

export default function Home() {
  return (
    <>
      <section className="mkt-hero">
        <div className="mkt-hero-inner">
          <div className="mkt-eyebrow">
            Workboat Code Edition 3 · 13 December 2026
          </div>
          <h1 className="mkt-h1">Which rules apply to your boat?</h1>
          <p className="mkt-hero-sub">
            Enter the boat once. Regulations quotes the clauses from SPVC 2025 and Workboat Code
            Edition 3 that apply to it, with the clause number and page.
          </p>
          <div className="mkt-hero-cta">
            <Link to="/app" className="mkt-btn mkt-btn-primary mkt-btn-lg">
              Start free
            </Link>
            <Link to="/solution" className="mkt-btn mkt-btn-ghost mkt-btn-lg">
              How it works
            </Link>
          </div>
          <div className="mkt-hero-stats">
            <div className="mkt-stat">
              <div className="mkt-stat-num">2</div>
              <div className="mkt-stat-label">MCA codes indexed</div>
            </div>
            <div className="mkt-stat">
              <div className="mkt-stat-num">3,449</div>
              <div className="mkt-stat-label">Clauses scope-tagged</div>
            </div>
            <div className="mkt-stat">
              <div className="mkt-stat-num">100%</div>
              <div className="mkt-stat-label">Answers cited to a clause</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-section-inner">
          <div className="mkt-section-head">
            <div className="mkt-eyebrow">Questions and answers</div>
            <h2 className="mkt-h2">What can I ask?</h2>
          </div>
          <div className="mkt-faq-list" style={{ maxWidth: "780px", margin: "0 auto" }}>
            {QUESTIONS.map((item) => (
              <div className="mkt-faq-item" key={item.q}>
                <div className="mkt-faq-q" style={{ cursor: "default" }}>{item.q}</div>
                <div className="mkt-faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta-banner">
        <div className="mkt-cta-inner">
          <h2 className="mkt-h2">Want to try a question?</h2>
          <p className="mkt-cta-sub">
            Fifteen questions are free. Set the boat, ask, and check the clause yourself. No card.
          </p>
          <div className="mkt-hero-cta">
            <Link to="/app" className="mkt-btn mkt-btn-primary mkt-btn-lg">
              Start free
            </Link>
            <Link to="/pricing" className="mkt-btn mkt-btn-ghost-invert mkt-btn-lg">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
