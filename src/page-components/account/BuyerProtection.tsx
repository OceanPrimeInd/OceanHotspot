// @ts-nocheck
"use client";

import { AccountContentPage } from "@/components/account/AccountContentPage";

const sections = [
  {
    title: "How We Help You Buy With Confidence",
    content: (
      <>
        <p>While the transaction is between you and the seller, we provide several layers of support:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold text-foreground">Verified Sellers</span> - We check seller identities and credentials so you know who you are dealing with.
          </li>
          <li>
            <span className="font-semibold text-foreground">Seller Ratings & Reviews</span> - See feedback from other buyers before you purchase.
          </li>
          <li>
            <span className="font-semibold text-foreground">Secure Messaging</span> - All communication stays on the platform, creating a record if needed.
          </li>
          <li>
            <span className="font-semibold text-foreground">Dispute Support</span> - If something goes wrong, our team can help facilitate a resolution.
          </li>
          <li>
            <span className="font-semibold text-foreground">Escrow Option</span> - For qualifying high-value items, escrow protection may be available.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Escrow Protection",
    content: (
      <>
        <p>For higher-value purchases, some sellers offer escrow as an additional layer of protection. When escrow is used:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold text-foreground">You Pay</span> - Funds are transferred to a secure escrow account, not directly to the seller.
          </li>
          <li>
            <span className="font-semibold text-foreground">Seller Ships</span> - The seller dispatches your order knowing payment is secured.
          </li>
          <li>
            <span className="font-semibold text-foreground">You Receive</span> - Inspect your order during the agreed inspection period.
          </li>
          <li>
            <span className="font-semibold text-foreground">Funds Released</span> - Once you confirm satisfaction (or the inspection period ends), payment is released to the seller.
          </li>
        </ul>
        <p>
          Escrow availability is indicated on eligible listings. Not all transactions use escrow - it is typically
          offered by sellers for items above a certain value.
        </p>
      </>
    ),
  },
  {
    title: "Verified Sellers",
    content: (
      <>
        <p>We verify sellers so you have more information about who you are buying from. Look for these trust indicators:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold text-foreground">Identity Verified</span> - Seller's identity has been confirmed.
          </li>
          <li>
            <span className="font-semibold text-foreground">Business Verified</span> - Registered business with verified company details.
          </li>
          <li>
            <span className="font-semibold text-foreground">Trusted Seller</span> - Established track record of successful transactions and positive reviews.
          </li>
          <li>
            <span className="font-semibold text-foreground">Expert Seller</span> - Specialist knowledge verified by industry credentials.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "If Something Goes Wrong",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <span className="font-semibold text-foreground">Step 1:</span> Contact the seller directly through your order. Most concerns can be resolved quickly.
        </li>
        <li>
          <span className="font-semibold text-foreground">Step 2:</span> If you cannot reach agreement, open a dispute through the platform.
        </li>
        <li>
          <span className="font-semibold text-foreground">Step 3:</span> Our support team will review the case and help facilitate a resolution.
        </li>
        <li>
          <span className="font-semibold text-foreground">Step 4:</span> For escrow transactions, funds are held until the dispute is resolved.
        </li>
      </ul>
    ),
  },
  {
    title: "Our Role as a Marketplace",
    content: (
      <p>
        Ocean Hotspot connects buyers and sellers but is not the seller of the products listed. The contract of sale is
        between you and the seller. We provide the platform, verification services, communication tools, and dispute
        support to help make transactions smoother and more transparent. Sellers are responsible for the accuracy of
        their listings and the quality of their products.
      </p>
    ),
  },
];

const BuyerProtection = () => {
  return (
    <AccountContentPage
      title="Buyer Protection"
      intro="Ocean Hotspot is a marketplace that connects buyers with sellers. We provide tools and services to help you buy with confidence, including verified sellers, secure communication, and support when things do not go to plan."
      sections={sections}
    />
  );
};

export default BuyerProtection;
