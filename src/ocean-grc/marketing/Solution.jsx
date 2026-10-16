import { Link } from "../lib/router";

const QUESTIONS = [
  {
    q: "How does it use the boat?",
    a: "You enter the boat once. Each question uses that length, area category, type, hull and passenger count. Clauses that cannot apply are left out before the answer is written.",
  },
  {
    q: "Can one question use both codes?",
    a: "Yes. SPVC 2025 and Workboat Code Edition 3 are searched separately, then the answer shows the difference for your boat.",
  },
  {
    q: "What do I get back?",
    a: "The Code’s own words, the clause number, and the page.",
  },
  {
    q: "What if a clause is unclear?",
    a: "It stays in the answer. A clause is removed only when the Code’s own wording conflicts with the boat.",
  },
];

export default function Solution() {
  return (
    <>
      <section className="mkt-hero mkt-hero-sm">
        <div className="mkt-hero-inner">
          <div className="mkt-eyebrow">How it works</div>
          <h1 className="mkt-h1">How does a question get answered?</h1>
          <p className="mkt-hero-sub">
            You set the boat. Regulations then quotes the clauses from SPVC 2025 and Workboat Code
            Edition 3 that apply to that boat.
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-section-inner">
          <div className="mkt-section-head">
            <div className="mkt-eyebrow">Questions and answers</div>
            <h2 className="mkt-h2">What does it do with the boat?</h2>
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

      <section className="mkt-section mkt-section-alt">
        <div className="mkt-section-inner">
          <div className="mkt-section-head">
            <div className="mkt-eyebrow">The steps</div>
            <h2 className="mkt-h2">What happens after I ask?</h2>
          </div>
          <div className="mkt-flow">
            <div className="mkt-flow-step">
              <div className="mkt-flow-title">1. The Code is split into clauses</div>
              <div className="mkt-flow-body">
                Each clause keeps its number, section and page. Contents pages are left out.
              </div>
            </div>
            <div className="mkt-flow-step">
              <div className="mkt-flow-title">2. Scope is read from the wording</div>
              <div className="mkt-flow-body">
                Phrases such as “vessels of less than 12 metres” and “area category of operation 0 or 1”
                are applied to that clause and to the clauses under it. Each exclusion records the phrase it used.
              </div>
            </div>
            <div className="mkt-flow-step">
              <div className="mkt-flow-title">3. Your boat is applied first</div>
              <div className="mkt-flow-body">
                Clauses that conflict with the boat are removed. The answer is written from the clauses that remain.
              </div>
            </div>
            <div className="mkt-flow-step">
              <div className="mkt-flow-title">4. You get the clause and the page</div>
              <div className="mkt-flow-body">
                The answer gives the result, the clause number, and the Code’s words. If a table could not be read, it names the table and page and asks you to check it.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-section-inner">
          <div className="mkt-section-head">
            <div className="mkt-eyebrow">Check the answer</div>
            <h2 className="mkt-h2">How do I check an answer?</h2>
          </div>
          <div className="mkt-note">
            Open the clause number and page in the published Code and read the quoted words there.
          </div>
        </div>
      </section>

      <section className="mkt-cta-banner">
        <div className="mkt-cta-inner">
          <h2 className="mkt-h2">Want to ask a question?</h2>
          <div className="mkt-hero-cta">
            <Link to="/app" className="mkt-btn mkt-btn-primary mkt-btn-lg">
              Start free
            </Link>
            <Link to="/documents" className="mkt-btn mkt-btn-ghost-invert mkt-btn-lg">
              Codes covered
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
