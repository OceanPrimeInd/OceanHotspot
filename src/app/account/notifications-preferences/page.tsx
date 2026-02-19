import type { Metadata } from "next";
import PageComponent from "@/page-components/account/NotificationsPreferences";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Notification Preferences",
  description: "Notification preferences.",
};

export default function Page() {
  return <PageComponent />;
}
