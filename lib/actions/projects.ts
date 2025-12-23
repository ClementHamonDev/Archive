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
  ProjectAnalytics,
  MonthlyActivityData,
  AbandonmentReasonStat,
  TagStat,
  TagSuccessRate,
  AbandonmentReason,
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

    if (
      existingProject.status !== "ABANDONED" &&
      existingProject.status !== "COMPLETED"
    ) {
      return error(
        "Seul un projet abandonné ou terminé peut être relancé",
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

/**
 * Get comprehensive analytics for the current user's projects
 */
export async function getProjectAnalytics(): Promise<
  ActionResult<ProjectAnalytics>
> {
  try {
    const userId = await requireAuth();

    // Get all projects with relations
    const userProjects = await db.query.projects.findMany({
      where: eq(projects.userId, userId),
      with: {
        tags: true,
        abandonment: true,
        revivals: true,
      },
    });

    // Calculate basic stats
    const total = userProjects.length;
    const active = userProjects.filter((p) => p.status === "ACTIVE").length;
    const completed = userProjects.filter(
      (p) => p.status === "COMPLETED",
    ).length;
    const abandoned = userProjects.filter(
      (p) => p.status === "ABANDONED",
    ).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate monthly activity for the last 6 months
    const monthlyActivity: MonthlyActivityData[] = [];
    const now = new Date();
    const months = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const createdInMonth = userProjects.filter((p) => {
        const created = new Date(p.createdAt);
        return created >= date && created <= monthEnd;
      }).length;

      const completedInMonth = userProjects.filter((p) => {
        if (!p.endDate) return false;
        const endDate = new Date(p.endDate);
        return endDate >= date && endDate <= monthEnd;
      }).length;

      const abandonedInMonth = userProjects.filter((p) => {
        if (!p.abandonedAt) return false;
        const abandonedAt = new Date(p.abandonedAt);
        return abandonedAt >= date && abandonedAt <= monthEnd;
      }).length;

      monthlyActivity.push({
        month: months[date.getMonth()],
        created: createdInMonth,
        completed: completedInMonth,
        abandoned: abandonedInMonth,
      });
    }

    // Calculate abandonment reasons
    const reasonCounts: Record<string, number> = {};
    userProjects.forEach((p) => {
      if (p.abandonment) {
        const reason = p.abandonment.mainReason;
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      }
    });

    const totalAbandoned = Object.values(reasonCounts).reduce(
      (a, b) => a + b,
      0,
    );
    const abandonmentReasons: AbandonmentReasonStat[] = Object.entries(
      reasonCounts,
    )
      .map(([reason, count]) => ({
        reason: reason as AbandonmentReason,
        count,
        percentage:
          totalAbandoned > 0 ? Math.round((count / totalAbandoned) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate top tags
    const tagCounts: Record<string, number> = {};
    userProjects.forEach((p) => {
      p.tags.forEach((tag) => {
        tagCounts[tag.label] = (tagCounts[tag.label] || 0) + 1;
      });
    });

    const topTags: TagStat[] = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate tag success rates
    const tagStats: Record<string, { total: number; completed: number }> = {};
    userProjects.forEach((p) => {
      p.tags.forEach((tag) => {
        if (!tagStats[tag.label]) {
          tagStats[tag.label] = { total: 0, completed: 0 };
        }
        tagStats[tag.label].total++;
        if (p.status === "COMPLETED") {
          tagStats[tag.label].completed++;
        }
      });
    });

    const tagSuccessRates: TagSuccessRate[] = Object.entries(tagStats)
      .filter(([, stats]) => stats.total >= 2) // Only tags with 2+ projects
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        completed: stats.completed,
        rate: Math.round((stats.completed / stats.total) * 100),
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 6);

    // Calculate key metrics
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const projectsStartedThisYear = userProjects.filter(
      (p) => new Date(p.createdAt) >= startOfYear,
    ).length;

    const projectsCompletedThisYear = userProjects.filter(
      (p) => p.endDate && new Date(p.endDate) >= startOfYear,
    ).length;

    // Revival success rate: revivals that led to completed projects
    const revivedProjects = userProjects.filter((p) => p.revivals.length > 0);
    const successfulRevivals = revivedProjects.filter(
      (p) => p.status === "COMPLETED",
    ).length;
    const revivalSuccessRate =
      revivedProjects.length > 0
        ? Math.round((successfulRevivals / revivedProjects.length) * 100)
        : 0;

    // Average time to abandon (in days)
    const abandonedProjects = userProjects.filter(
      (p) => p.abandonedAt && p.startDate,
    );
    let avgTimeToAbandonDays: number | null = null;
    if (abandonedProjects.length > 0) {
      const totalDays = abandonedProjects.reduce((sum, p) => {
        const start = new Date(p.startDate).getTime();
        const abandoned = new Date(p.abandonedAt!).getTime();
        return sum + (abandoned - start) / (1000 * 60 * 60 * 24);
      }, 0);
      avgTimeToAbandonDays = Math.round(totalDays / abandonedProjects.length);
    }

    return success({
      stats: {
        total,
        active,
        completed,
        abandoned,
        completionRate,
      },
      monthlyActivity,
      abandonmentReasons,
      topTags,
      tagSuccessRates,
      keyMetrics: {
        projectsStartedThisYear,
        projectsCompletedThisYear,
        revivalSuccessRate,
        avgTimeToAbandonDays,
      },
    });
  } catch (err) {
    console.error("Error getting project analytics:", err);
    return error(
      err instanceof Error
        ? err.message
        : "Impossible de récupérer les analytics",
      "GET_ANALYTICS_ERROR",
    );
  }
}
