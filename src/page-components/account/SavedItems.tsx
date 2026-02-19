// @ts-nocheck
"use client";

import { AccountContentPage } from "@/components/account/AccountContentPage";

const sections = [
  {
    title: "Your Saved Items",
    content: (
      <>
        <p>Everything you have bookmarked appears here. For each saved item you can:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Add to basket when you are ready to buy</li>
          <li>Check current price and availability</li>
          <li>See if it is compatible with your registered vessels</li>
          <li>Remove items you no longer need</li>
          <li>Move to a specific vessel list</li>
        </ul>
      </>
    ),
  },
  {
    title: "Organise by Vessel",
    content: (
      <p>
        If you own multiple boats, organise your saved items by vessel. Create separate lists for each boat so you
        always know which parts and products are intended for which vessel. This makes it easy to plan maintenance,
        upgrades, or seasonal preparations for each boat individually.
      </p>
    ),
  },
  {
    title: "Alerts",
    content: (
      <>
        <p>Never miss a deal or restock on items you are watching:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold text-foreground">Price Drop Alerts</span> - Get notified when a saved item goes on sale or reduces in price.
          </li>
          <li>
            <span className="font-semibold text-foreground">Back in Stock</span> - We will tell you when out-of-stock items become available again.
          </li>
          <li>
            <span className="font-semibold text-foreground">Seasonal Reminders</span> - Receive prompts for seasonal items like antifoul, winterisation products, or annual service parts.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Compatibility Check",
    content: (
      <p>
        When you have registered your vessel details, we will flag any saved items that may not be compatible. Look
        for the compatibility indicator on each product to help avoid ordering the wrong part.
      </p>
    ),
  },
  {
    title: "Share Your List",
    content: (
      <p>
        Share your saved items with crew members, partners, or marine professionals. Useful for getting advice,
        coordinating purchases, or creating a gift list.
      </p>
    ),
  },
];

const SavedItems = () => {
  return (
    <AccountContentPage
      title="Saved Items"
      intro="Keep track of products you are interested in. Save items for later, organise them by vessel, and get notified when prices drop or stock returns."
      sections={sections}
    />
  );
};

export default SavedItems;
