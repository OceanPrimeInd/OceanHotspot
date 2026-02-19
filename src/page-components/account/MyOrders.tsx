// @ts-nocheck
"use client";

import Link from "next/link";
import { AccountContentPage } from "@/components/account/AccountContentPage";

const sections = [
  {
    title: "Order Status",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <span className="font-semibold text-foreground">Order Placed</span> - Your order has been received and sent to the seller.
        </li>
        <li>
          <span className="font-semibold text-foreground">Confirmed</span> - The seller has confirmed your order and is preparing it for dispatch.
        </li>
        <li>
          <span className="font-semibold text-foreground">Dispatched</span> - Your order is on its way. Track delivery progress with the provided tracking link.
        </li>
        <li>
          <span className="font-semibold text-foreground">Delivered</span> - Your order has arrived.
        </li>
        <li>
          <span className="font-semibold text-foreground">Completed</span> - Transaction complete. Leave a review to help other buyers.
        </li>
      </ul>
    ),
  },
  {
    title: "Escrow Orders",
    content: (
      <>
        <p>
          For higher-value purchases, some sellers offer escrow protection. When escrow is used, your payment is held
          securely until you confirm the item has arrived and meets expectations. Orders using escrow will show an
          additional status indicator:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold text-foreground">Funds Held</span> - Payment is held in escrow pending delivery.
          </li>
          <li>
            <span className="font-semibold text-foreground">Release Pending</span> - Item delivered. Inspection period active.
          </li>
          <li>
            <span className="font-semibold text-foreground">Released</span> - Funds released to seller. Transaction complete.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Order Actions",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>View full order details and itemised breakdown</li>
        <li>Download invoice or receipt</li>
        <li>Track delivery in real-time</li>
        <li>Message the seller directly</li>
        <li>Request a return or raise a concern</li>
        <li>Reorder items you have purchased before</li>
        <li>Leave a review once your order is complete</li>
      </ul>
    ),
  },
  {
    title: "Linked Vessel",
    content: (
      <p>
        If you have registered your vessel, orders can be linked to the relevant boat. This helps you track what has
        been purchased for each vessel and build a record of parts and products over time.
      </p>
    ),
  },
  {
    title: "Help",
    content: (
      <p>
        Need help with an order? Visit our{" "}
        <Link href="/help" className="text-primary hover:text-primary/80 underline">
          Help Centre
        </Link>
        {" "}
        or contact our{" "}
        <Link href="/contact" className="text-primary hover:text-primary/80 underline">
          support team
        </Link>
        .
      </p>
    ),
  },
];

const MyOrders = () => {
  return (
    <AccountContentPage
      title="My Orders"
      intro="Track, manage, and review all your Ocean Hotspot purchases in one place. View order status, communicate with sellers, and access your purchase history."
      sections={sections}
    />
  );
};

export default MyOrders;
