// @ts-nocheck
"use client";

import { AccountContentPage } from "@/components/account/AccountContentPage";

const sections = [
  {
    title: "Address Types",
    content: (
      <>
        <p>Add different address types to match how you receive deliveries:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Home - Your residential address.</li>
          <li>Work - Your business or office address.</li>
          <li>Marina - Berth or pontoon address for direct-to-boat delivery.</li>
          <li>Boatyard - Collection point at a yard or chandlery.</li>
          <li>Other - Any other delivery location.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Marina & Boatyard Addresses",
    content: (
      <>
        <p>For marine locations, you can add extra details to help ensure smooth delivery:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Marina or boatyard name</li>
          <li>Berth, pontoon, or yard reference number</li>
          <li>Boat name (for identification)</li>
          <li>Gate codes or access instructions</li>
          <li>Contact number for the marina office</li>
        </ul>
      </>
    ),
  },
  {
    title: "Default Address",
    content: (
      <p>
        Set a default delivery address that is automatically selected at checkout. You can always change it for
        individual orders.
      </p>
    ),
  },
  {
    title: "Delivery Instructions",
    content: (
      <p>
        Add specific instructions for each address - where to leave packages, who to contact, or any access requirements.
        These notes are shared with the seller to pass on to their courier.
      </p>
    ),
  },
];

const Addresses = () => {
  return (
    <AccountContentPage
      title="Addresses"
      intro="Save your delivery addresses for quick checkout. Whether you are shipping to home, work, a marina, or a boatyard, keep all your locations organised in one place."
      sections={sections}
    />
  );
};

export default Addresses;
