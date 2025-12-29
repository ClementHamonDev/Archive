import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <SettingsClient user={session.user} />;
}
