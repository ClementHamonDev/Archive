"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const website = formData.get("website") as string;

  console.log("Updating profile:", {
    name,
    location,
    website,
    userId: session.user.id,
  });

  try {
    const result = await db
      .update(user)
      .set({
        name,
        location,
        website,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning();

    console.log("Update result:", result);
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
