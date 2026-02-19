// @ts-nocheck
"use client";

import { AccountContentPage } from "@/components/account/AccountContentPage";

const sections = [
  {
    title: "Returns",
    content: (
      <>
        <p>
          Return policies are set by individual sellers and vary between listings. Check the seller's return policy
          before purchasing. If a seller accepts returns, you can track the status here:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold text-foreground">Return Requested</span> - Waiting for seller to respond.
          </li>
          <li>
            <span className="font-semibold text-foreground">Return Approved</span> - Seller has agreed. Follow the provided instructions to send the item back.
          </li>
          <li>
            <span className="font-semibold text-foreground">Item in Transit</span> - Your return is on its way to the seller.
          </li>
          <li>
            <span className="font-semibold text-foreground">Received by Seller</span> - Seller is inspecting the returned item.
          </li>
          <li>
            <span className="font-semibold text-foreground">Refund Processed</span> - Your refund has been issued by the seller.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Starting a Return",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>Go to My Orders and find the relevant order</li>
        <li>Select "Request Return" and choose your reason</li>
        <li>Add photos if the item is damaged or incorrect</li>
        <li>Submit and wait for the seller's response</li>
      </ul>
    ),
  },
  {
    title: "Disputes",
    content: (
      <>
        <p>
          If you cannot resolve an issue directly with the seller, you can open a dispute and our support team will help
          facilitate a resolution:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold text-foreground">Dispute Opened</span> - Our support team has received your case.
          </li>
          <li>
            <span className="font-semibold text-foreground">Under Review</span> - We are gathering information from both parties.
          </li>
          <li>
            <span className="font-semibold text-foreground">Resolution Proposed</span> - We have suggested a way forward for both parties to consider.
          </li>
          <li>
            <span className="font-semibold text-foreground">Resolved</span> - The dispute has been closed.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Escrow Disputes",
    content: (
      <p>
        For transactions using escrow, funds remain held until the dispute is resolved. This provides additional
        protection on qualifying high-value purchases.
      </p>
    ),
  },
  {
    title: "Refunds",
    content: (
      <p>
        Refunds are processed by sellers and returned to your original payment method. Timing depends on the seller and
        your bank or card provider. Track refund status from this page.
      </p>
    ),
  },
];

const ReturnsDisputes = () => {
  return (
    <AccountContentPage
      title="Returns & Disputes"
      intro="Manage your active returns and any open disputes. Track progress, communicate with sellers, and view the history of resolved cases."
      sections={sections}
    />
  );
};

export default ReturnsDisputes;
