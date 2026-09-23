import { redirect } from "next/navigation";

/** Public selling entry is unified at /sell (website map 18 Sep). */
export default function Page() {
  redirect("/sell");
}
