import { useState } from "react";
import { Link } from "../lib/router";

const FAQS = [
  {
    q: "Does it use my boat?",
    a: "Yes. You set length overall, area category, vessel type, hull material and passenger count once. Each later question uses that boat. Clauses that cannot apply are left out of the answer.",
  },
  {
    q: "Which codes does it cover?",
    a: "MCA Sport or Pleasure Vessel Code 2025 and MCA Workboat Code Edition 3. You can ask about both in one question. Uncrewed vessels (WB3 Annex 2 and MGN 664), the MGN/MIN/MSN notices, MSN 1871 and the Recreational Craft Regulations are next.",
  },
  {
    q: "Can it compare two codes for the same boat?",
    a: "Yes. Ask what changes for your boat between SPVC 2025 and Workboat Code Edition 3. The answer cites the governing clause in each code. Each code is searched on its own.",
  },
  {
    q: "What if the answer is not in the Code?",
    a: "Regulations says so, and names where to look: the Merchant Shipping Regulations, a licensed ISO or BSI standard, or the Certifying Authority.",
  },
  {
    q: "Is the answer legally binding?",
    a: "No. Regulations is a reference tool. It is not the MCA and it is not a Certifying Authority. Check anything important with them before you act on it.",
  },
  {
    q: "Why does it quote the clause?",
    a: "A design note needs the Code’s own words, the clause number, and the page. The quote is what you file.",
  },
  {
    q: "What if the answer is in a table?",
    a: "Some tables lose their rows and columns when the PDF is read. Regulations then names the table and page and asks you to check the table yourself. It does not invent a cell value.",
  },
  {
    q: "How does it decide a clause does not apply?",
    a: "It reads scope phrases in the Code, such as “vessels of less than 12 metres” and “area category of operation 0 or 1”, and applies them to child clauses. Each exclusion records the phrase it used. If the wording is unclear, the clause stays in.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Sign-in and storage use Supabase with row-level security. Your account can read only its own boat profiles and history. The boat details are used to filter answers. They are not shared.",
  },
  {
    q: "Do you include ISO or BSI standards?",
    a: "No. ISO and BSI standards are licensed, so the text is not stored. MCA and gov.uk publications are Crown copyright under the Open Government Licence, so those are included. If an answer depends on ISO 12215 or ISO 12217, Regulations names the standard and stops.",
  },
  {
    q: "Who is this for?",
    a: "Naval architects, small-craft designers, marine surveyors, compliance consultants and Certifying Authorities working on boats from 3m to 15m. It answers design and assessment questions. It does not send certificate reminders or maintenance schedules.",
  },
  {
    q: "What does 13 December 2026 mean?",
    a: "Workboat Code Edition 3 came into force on 13 December 2023. Boats certificated under the Brown Code, the MGN 280(M) technical annex, or Edition 2 Amendment 1 must meet Edition 3 by their next renewal examination or by 13 December 2026.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`mkt-faq-item ${open ? "open" : ""}`}>
      <button className="mkt-faq-q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span className="mkt-faq-mark">{open ? "\u2212" : "+"}</span>
      </button>
      {open && <div className="mkt-faq-a">{a}</div>}
    </div>
  );
}

export default function FAQ() {
  return (
    <>
      <section className="mkt-hero mkt-hero-sm">
        <div className="mkt-hero-inner">
          <div className="mkt-eyebrow">FAQ</div>
          <h1 className="mkt-h1">Questions and answers</h1>
          <p className="mkt-hero-sub">
            Email us if your question is not here.
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-section-inner mkt-faq-list">
          {FAQS.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      <section className="mkt-cta-banner">
        <div className="mkt-cta-inner">
          <h2 className="mkt-h2">Still have a question?</h2>
          <div className="mkt-hero-cta">
            <a href="mailto:hello@oceangrc.com" className="mkt-btn mkt-btn-primary mkt-btn-lg">
              Email us
            </a>
            <Link to="/app" className="mkt-btn mkt-btn-ghost-invert mkt-btn-lg">
              Start free
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
