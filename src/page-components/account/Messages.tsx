// @ts-nocheck
"use client";

import { AccountContentPage } from "@/components/account/AccountContentPage";

const sections = [
  {
    title: "Conversations",
    content: (
      <>
        <p>Your message inbox organises conversations by type:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold text-foreground">Seller Messages</span> - Pre-purchase questions, order updates, and post-sale communication.
          </li>
          <li>
            <span className="font-semibold text-foreground">Support</span> - Help requests and customer service conversations.
          </li>
          <li>
            <span className="font-semibold text-foreground">Archived</span> - Completed conversations you may want to reference later.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Linked to Orders",
    content: (
      <p>
        Messages relating to specific orders are automatically linked. You can access the conversation directly from
        your order details, and we will show order information alongside the chat so you have full context.
      </p>
    ),
  },
  {
    title: "Why Message Through Ocean Hotspot",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>All communication is logged, which helps if you need support later</li>
        <li>Sellers can respond through our system without sharing personal contact details</li>
        <li>Message history stays linked to your orders for easy reference</li>
        <li>Our support team can review conversations if a dispute arises</li>
      </ul>
    ),
  },
];

const Messages = () => {
  return (
    <AccountContentPage
      title="Messages"
      intro="All your Ocean Hotspot conversations in one place. Message sellers, ask questions, and manage support queries without leaving the platform."
      sections={sections}
    />
  );
};

export default Messages;
