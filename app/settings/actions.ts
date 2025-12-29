"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { projects } from "@/db/schema/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteAllProjects() {
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.delete(projects).where(eq(projects.userId, session.user.id));

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting projects:", error);
    return { success: false, error: "Failed to delete projects" };
  }
}

export async function deleteAccount() {
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Supprimer l'utilisateur (cascade supprimera les projets, sessions, etc.)
    await db.delete(user).where(eq(user.id, session.user.id));

    // Déconnecter l'utilisateur
    redirect("/");
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}

export async function exportUserData() {
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Récupérer toutes les données de l'utilisateur
    const [userData, userProjects] = await Promise.all([
      db
        .select()
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1)
        .then((res) => res[0]),
      db.select().from(projects).where(eq(projects.userId, session.user.id)),
    ]);

    const exportData = {
      user: userData,
      projects: userProjects,
      exportedAt: new Date().toISOString(),
    };

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting data:", error);
    return { success: false, error: "Failed to export data" };
  }
}
