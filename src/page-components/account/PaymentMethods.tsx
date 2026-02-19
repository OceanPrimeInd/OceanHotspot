// @ts-nocheck
"use client";

import { AccountContentPage } from "@/components/account/AccountContentPage";

const sections = [
  {
    title: "Saved Cards",
    content: (
      <>
        <p>Add, edit, or remove your saved payment cards:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Credit and debit cards (Visa, Mastercard, Amex)</li>
          <li>Set a default card for faster checkout</li>
          <li>Add a nickname to each card for easy identification</li>
          <li>Remove expired or unused cards</li>
        </ul>
      </>
    ),
  },
  {
    title: "Billing Addresses",
    content: (
      <p>Each card can have an associated billing address. Keep these up to date to avoid payment failures.</p>
    ),
  },
  {
    title: "Payment Security",
    content: (
      <>
        <p>Your payment security is important:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>All transactions are encrypted with industry-standard SSL/TLS</li>
          <li>We never store your full card number - only a secure token</li>
          <li>Payments are processed by trusted, PCI-compliant providers</li>
          <li>Suspicious activity triggers automatic alerts</li>
        </ul>
      </>
    ),
  },
  {
    title: "Trade Accounts",
    content: (
      <p>
        Approved trade customers can access credit terms and consolidated invoicing. If you have a trade account,
        manage your credit limit, view statements, and track outstanding balances from this section.
      </p>
    ),
  },
];

const PaymentMethods = () => {
  return (
    <AccountContentPage
      title="Payment Methods"
      intro="Manage your saved payment methods for faster, smoother checkout. Your payment details are encrypted and stored securely."
      sections={sections}
    />
  );
};

export default PaymentMethods;
