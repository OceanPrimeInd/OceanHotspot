// @ts-nocheck
"use client";

import { AccountContentPage } from "@/components/account/AccountContentPage";

const sections = [
  {
    title: "Add a Vessel",
    content: (
      <>
        <p>Create a profile for each boat you own or manage:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold text-foreground">Basic Details</span> - Name, make, model, year, and hull identification number (HIN).
          </li>
          <li>
            <span className="font-semibold text-foreground">Dimensions</span> - Length, beam, draft, and displacement.
          </li>
          <li>
            <span className="font-semibold text-foreground">Propulsion</span> - Engine type, make, model, and specifications.
          </li>
          <li>
            <span className="font-semibold text-foreground">Systems</span> - Electrical system voltage, navigation equipment, and other fitted systems.
          </li>
          <li>
            <span className="font-semibold text-foreground">Photos</span> - Upload images to help identify your vessel.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Compatibility Matching",
    content: (
      <p>
        Once your vessel is registered, we can help check product compatibility as you browse. No more guessing whether
        that impeller fits your engine or if those navigation lights meet your boat's electrical specs. Look for the
        compatibility indicator on product listings.
      </p>
    ),
  },
  {
    title: "Personalised Recommendations",
    content: (
      <p>
        Based on your vessel profile, we can suggest products that are relevant to your boat. Whether it is the right
        grade of antifoul for your hull type or engine oil that matches your manufacturer's specifications, our
        recommendations are tailored to your setup.
      </p>
    ),
  },
  {
    title: "Maintenance Tracking",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>Log service dates and work completed</li>
        <li>Track which parts have been fitted and when</li>
        <li>Set reminders for scheduled maintenance</li>
        <li>Store receipts and documentation</li>
        <li>Build a comprehensive service history for resale value</li>
      </ul>
    ),
  },
  {
    title: "Seasonal Reminders",
    content: (
      <p>
        We can prompt you when it is time for seasonal tasks like winterisation, antifouling, or annual service. Never
        miss a maintenance window again.
      </p>
    ),
  },
];

const MyVessels = () => {
  return (
    <AccountContentPage
      title="My Vessels"
      intro="Register your boats to unlock personalised product recommendations, compatibility checking, and maintenance reminders. The more we know about your vessel, the better we can help you find what you need."
      sections={sections}
    />
  );
};

export default MyVessels;
