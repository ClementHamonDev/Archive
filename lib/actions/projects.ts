"use server";

import { db } from "@/db";
import {
  projects,
  projectTags,
  projectAbandonments,
  projectRevivals,
} from "@/db/schema/schema";
import { getSession } from "@/lib/auth";
import {
  ActionResult,
  success,
  error,
  ProjectWithRelations,
  ProjectStats,
} from "@/lib/types";
import {
  createProjectSchema,
  updateProjectSchema,
  completeProjectSchema,
  abandonProjectSchema,
  reviveProjectSchema,
  deleteProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type CompleteProjectInput,
  type AbandonProjectInput,
  type ReviveProjectInput,
} from "@/lib/validations/project";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Get the current user ID from session
 * @throws Redirects if not authenticated
 */
async function requireAuth(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }
  return session.user.id;
}

/**
 * Get all projects for the current user
 */
export async function getProjects(): Promise<
  ActionResult<ProjectWithRelations[]>
> {
  try {
    const userId = await requireAuth();

    const userProjects = await db.query.projects.findMany({
      where: eq(projects.userId, userId),
      orderBy: [desc(projects.updatedAt)],
      with: {
        tags: true,
        abandonment: true,
        revivals: true,
      },
    });

    return success(userProjects as ProjectWithRelations[]);
  } catch (err) {
    console.error("Error getting projects:", err);
    return error(
      err instanceof Error
        ? err.message
        : "Impossible de récupérer les projets",
      "GET_PROJECTS_ERROR",
    );
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(
  id: string,
): Promise<ActionResult<ProjectWithRelations>> {
  try {
    const userId = await requireAuth();

    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.userId, userId)),
      with: {
        tags: true,
        abandonment: true,
        revivals: true,
      },
    });

    if (!project) {
      return error("Projet non trouvé", "PROJECT_NOT_FOUND");
    }

    return success(project as ProjectWithRelations);
  } catch (err) {
    console.error("Error getting project:", err);
    return error(
      err instanceof Error ? err.message : "Impossible de récupérer le projet",
      "GET_PROJECT_ERROR",
    );
  }
}

/**
 * Create a new project
 */
export async function createProject(
  input: CreateProjectInput,
): Promise<ActionResult<ProjectWithRelations>> {
  try {
    const userId = await requireAuth();

    // Validate input
    const parsed = createProjectSchema.safeParse(input);
    if (!parsed.success) {
      return error(
        parsed.error.issues[0]?.message || "Données invalides",
        "VALIDATION_ERROR",
      );
    }

    const { tags, ...projectData } = parsed.data;

    // Create project
    const [newProject] = await db
      .insert(projects)
      .values({
        ...projectData,
        userId,
        repositoryUrl: projectData.repositoryUrl || null,
        liveUrl: projectData.liveUrl || null,
        description: projectData.description || null,
      })
      .returning();

    // Create tags if provided
    if (tags && tags.length > 0) {
      await db.insert(projectTags).values(
        tags.map((label) => ({
          projectId: newProject.id,
          label,
        })),
      );
    }

    // Fetch the complete project with relations
    const projectWithRelations = await db.query.projects.findFirst({
      where: eq(projects.id, newProject.id),
      with: {
        tags: true,
        abandonment: true,
        revivals: true,
      },
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return success(projectWithRelations as ProjectWithRelations);
  } catch (err) {
    console.error("Error creating project:", err);
    return error(
      err instanceof Error ? err.message : "Impossible de créer le projet",
      "CREATE_PROJECT_ERROR",
    );
  }
}

/**
 * Update an existing project
 */
export async function updateProject(
  input: UpdateProjectInput,
): Promise<ActionResult<ProjectWithRelations>> {
  try {
    const userId = await requireAuth();

    // Validate input
    const parsed = updateProjectSchema.safeParse(input);
    if (!parsed.success) {
      return error(
        parsed.error.issues[0]?.message || "Données invalides",
        "VALIDATION_ERROR",
      );
    }

    const { id, tags, ...updateData } = parsed.data;

    // Check project exists and belongs to user
    const existingProject = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.userId, userId)),
    });

    if (!existingProject) {
      return error("Projet non trouvé", "PROJECT_NOT_FOUND");
    }

    // Update project
    await db
      .update(projects)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id));

    // Update tags if provided
    if (tags !== undefined) {
      // Delete existing tags
      await db.delete(projectTags).where(eq(projectTags.projectId, id));

      // Insert new tags
      if (tags.length > 0) {
        await db.insert(projectTags).values(
          tags.map((label) => ({
            projectId: id,
            label,
          })),
        );
      }
    }

    // Fetch the complete project with relations
    const projectWithRelations = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        tags: true,
        abandonment: true,
        revivals: true,
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");

    return success(projectWithRelations as ProjectWithRelations);
  } catch (err) {
    console.error("Error updating project:", err);
    return error(
      err instanceof Error
        ? err.message
        : "Impossible de mettre à jour le projet",
      "UPDATE_PROJECT_ERROR",
    );
  }
}

/**
 * Mark a project as completed
 */
export async function completeProject(
  input: CompleteProjectInput,
): Promise<ActionResult<ProjectWithRelations>> {
  try {
    const userId = await requireAuth();

    // Validate input
    const parsed = completeProjectSchema.safeParse(input);
    if (!parsed.success) {
      return error(
        parsed.error.issues[0]?.message || "Données invalides",
        "VALIDATION_ERROR",
      );
    }

    const { id, endDate } = parsed.data;

    // Check project exists and belongs to user
    const existingProject = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.userId, userId)),
    });

    if (!existingProject) {
      return error("Projet non trouvé", "PROJECT_NOT_FOUND");
    }

    // Update project status
    await db
      .update(projects)
      .set({
        status: "COMPLETED",
        endDate,
        abandonedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id));

    // Delete abandonment record if exists
    await db
      .delete(projectAbandonments)
      .where(eq(projectAbandonments.projectId, id));

    // Fetch the complete project with relations
    const projectWithRelations = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        tags: true,
        abandonment: true,
        revivals: true,
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/analytics");

    return success(projectWithRelations as ProjectWithRelations);
  } catch (err) {
    console.error("Error completing project:", err);
    return error(
      err instanceof Error
        ? err.message
        : "Impossible de marquer le projet comme terminé",
      "COMPLETE_PROJECT_ERROR",
    );
  }
}

/**
 * Mark a project as abandoned with analysis
 */
export async function abandonProject(
  input: AbandonProjectInput,
): Promise<ActionResult<ProjectWithRelations>> {
  try {
    const userId = await requireAuth();

    // Validate input
    const parsed = abandonProjectSchema.safeParse(input);
    if (!parsed.success) {
      return error(
        parsed.error.issues[0]?.message || "Données invalides",
        "VALIDATION_ERROR",
      );
    }

    const { id, mainReason, secondaryReasons, retrospective, lessonsLearned } =
      parsed.data;

    // Check project exists and belongs to user
    const existingProject = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.userId, userId)),
    });

    if (!existingProject) {
      return error("Projet non trouvé", "PROJECT_NOT_FOUND");
    }

    // Update project status
    await db
      .update(projects)
      .set({
        status: "ABANDONED",
        abandonedAt: new Date(),
        endDate: null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id));

    // Create or update abandonment record
    const existingAbandonment = await db.query.projectAbandonments.findFirst({
      where: eq(projectAbandonments.projectId, id),
    });

    if (existingAbandonment) {
      await db
        .update(projectAbandonments)
        .set({
          mainReason,
          secondaryReasons: secondaryReasons || null,
          retrospective: retrospective || null,
          lessonsLearned: lessonsLearned || null,
        })
        .where(eq(projectAbandonments.projectId, id));
    } else {
      await db.insert(projectAbandonments).values({
        projectId: id,
        mainReason,
        secondaryReasons: secondaryReasons || null,
        retrospective: retrospective || null,
        lessonsLearned: lessonsLearned || null,
      });
    }

    // Fetch the complete project with relations
    const projectWithRelations = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        tags: true,
        abandonment: true,
        revivals: true,
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/analytics");

    return success(projectWithRelations as ProjectWithRelations);
  } catch (err) {
    console.error("Error abandoning project:", err);
    return error(
      err instanceof Error ? err.message : "Impossible d'abandonner le projet",
      "ABANDON_PROJECT_ERROR",
    );
  }
}

/**
 * Revive an abandoned project
 */
export async function reviveProject(
  input: ReviveProjectInput,
): Promise<ActionResult<ProjectWithRelations>> {
  try {
    const userId = await requireAuth();

    // Validate input
    const parsed = reviveProjectSchema.safeParse(input);
    if (!parsed.success) {
      return error(
        parsed.error.issues[0]?.message || "Données invalides",
        "VALIDATION_ERROR",
      );
    }

    const { id, note } = parsed.data;

    // Check project exists and belongs to user
    const existingProject = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.userId, userId)),
    });

    if (!existingProject) {
      return error("Projet non trouvé", "PROJECT_NOT_FOUND");
    }

    if (existingProject.status !== "ABANDONED") {
      return error(
        "Seul un projet abandonné peut être relancé",
        "INVALID_STATUS",
      );
    }

    // Update project status
    await db
      .update(projects)
      .set({
        status: "ACTIVE",
        abandonedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id));

    // Create revival record
    await db.insert(projectRevivals).values({
      projectId: id,
      note: note || null,
    });

    // Fetch the complete project with relations
    const projectWithRelations = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        tags: true,
        abandonment: true,
        revivals: true,
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/analytics");

    return success(projectWithRelations as ProjectWithRelations);
  } catch (err) {
    console.error("Error reviving project:", err);
    return error(
      err instanceof Error ? err.message : "Impossible de relancer le projet",
      "REVIVE_PROJECT_ERROR",
    );
  }
}

/**
 * Delete a project
 */
export async function deleteProject(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireAuth();

    // Validate input
    const parsed = deleteProjectSchema.safeParse({ id });
    if (!parsed.success) {
      return error(
        parsed.error.issues[0]?.message || "Données invalides",
        "VALIDATION_ERROR",
      );
    }

    // Check project exists and belongs to user
    const existingProject = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.userId, userId)),
    });

    if (!existingProject) {
      return error("Projet non trouvé", "PROJECT_NOT_FOUND");
    }

    // Delete project (cascade will handle related records)
    await db.delete(projects).where(eq(projects.id, id));

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath("/analytics");

    return success({ id });
  } catch (err) {
    console.error("Error deleting project:", err);
    return error(
      err instanceof Error ? err.message : "Impossible de supprimer le projet",
      "DELETE_PROJECT_ERROR",
    );
  }
}

/**
 * Get project statistics for the current user
 */
export async function getProjectStats(): Promise<ActionResult<ProjectStats>> {
  try {
    const userId = await requireAuth();

    const stats = await db
      .select({
        total: count(),
        active: sql<number>`count(*) filter (where ${projects.status} = 'ACTIVE')`,
        completed: sql<number>`count(*) filter (where ${projects.status} = 'COMPLETED')`,
        abandoned: sql<number>`count(*) filter (where ${projects.status} = 'ABANDONED')`,
      })
      .from(projects)
      .where(eq(projects.userId, userId));

    const { total, active, completed, abandoned } = stats[0] || {
      total: 0,
      active: 0,
      completed: 0,
      abandoned: 0,
    };

    const completionRate =
      total > 0 ? Math.round((Number(completed) / total) * 100) : 0;

    return success({
      total,
      active: Number(active),
      completed: Number(completed),
      abandoned: Number(abandoned),
      completionRate,
    });
  } catch (err) {
    console.error("Error getting project stats:", err);
    return error(
      err instanceof Error
        ? err.message
        : "Impossible de récupérer les statistiques",
      "GET_STATS_ERROR",
    );
  }
}
