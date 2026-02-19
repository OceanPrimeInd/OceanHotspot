// @ts-nocheck
"use client";

import { AccountContentPage } from "@/components/account/AccountContentPage";

const sections = [
  {
    title: "Email Preferences",
    content: (
      <>
        <p>Choose which emails you receive:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Order Updates - Confirmation, dispatch, and delivery notifications (always on for active orders).</li>
          <li>Price Alerts - Notifications when saved items drop in price.</li>
          <li>Back in Stock - Alerts when out-of-stock items you are watching become available.</li>
          <li>Seasonal Reminders - Maintenance prompts based on your vessel and the time of year.</li>
          <li>Recommendations - Personalised product suggestions based on your vessels and browsing.</li>
          <li>Newsletter - Ocean Hotspot news, tips, and featured products.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Push Notifications",
    content: (
      <>
        <p>If you use the Ocean Hotspot app, control which push notifications you receive:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Order status changes</li>
          <li>New messages from sellers</li>
          <li>Price drop alerts</li>
          <li>Dispute and refund updates</li>
        </ul>
      </>
    ),
  },
  {
    title: "SMS Alerts",
    content: (
      <p>
        Opt in to receive text messages for critical updates like dispatch notifications and delivery alerts. Useful
        when you are away from email or at sea.
      </p>
    ),
  },
  {
    title: "Communication Frequency",
    content: (
      <>
        <p>Control how often you hear from us:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Real-time - Get notifications as events happen.</li>
          <li>Daily Digest - Receive a summary of the day's activity each evening.</li>
          <li>Weekly Digest - Get a weekly roundup of what is new.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Unsubscribe",
    content: (
      <p>
        You can unsubscribe from all marketing communications at any time. Transactional messages about your orders
        will still be sent to keep you informed about purchases.
      </p>
    ),
  },
];

const NotificationsPreferences = () => {
  return (
    <AccountContentPage
      title="Notifications & Preferences"
      intro="Control how and when we communicate with you. Choose which updates matter to you and how you would like to receive them."
      sections={sections}
    />
  );
};

export default NotificationsPreferences;
