import { z } from "zod";

/**
 * Project validation schemas
 */

export const projectStatusValues = [
  "ACTIVE",
  "COMPLETED",
  "ABANDONED",
] as const;
export const abandonmentReasonValues = [
  "TIME",
  "MOTIVATION",
  "TECHNICAL",
  "SCOPE",
  "MARKET",
  "ORGANIZATION",
  "BURNOUT",
  "OTHER",
] as const;

// Schema for creating a new project
export const createProjectSchema = z.object({
  name: z
    .string({ error: "Le nom est requis" })
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z
    .string()
    .max(2000, "La description ne peut pas dépasser 2000 caractères")
    .optional()
    .nullable(),
  repositoryUrl: z
    .string()
    .url("L'URL du dépôt n'est pas valide")
    .optional()
    .nullable()
    .or(z.literal("")),
  liveUrl: z
    .string()
    .url("L'URL du site n'est pas valide")
    .optional()
    .nullable()
    .or(z.literal("")),
  startDate: z.coerce.date({ error: "La date de début est requise" }),
  status: z.enum(projectStatusValues).default("ACTIVE"),
  isPublic: z.boolean().default(false),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, "Vous ne pouvez pas ajouter plus de 10 tags")
    .optional()
    .default([]),
});

// Schema for updating a project
export const updateProjectSchema = z.object({
  id: z.string().uuid("ID de projet invalide"),
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .optional(),
  description: z
    .string()
    .max(2000, "La description ne peut pas dépasser 2000 caractères")
    .optional()
    .nullable(),
  repositoryUrl: z
    .string()
    .url("L'URL du dépôt n'est pas valide")
    .optional()
    .nullable()
    .or(z.literal("")),
  liveUrl: z
    .string()
    .url("L'URL du site n'est pas valide")
    .optional()
    .nullable()
    .or(z.literal("")),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  status: z.enum(projectStatusValues).optional(),
  isPublic: z.boolean().optional(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, "Vous ne pouvez pas ajouter plus de 10 tags")
    .optional(),
});

// Schema for marking a project as completed
export const completeProjectSchema = z.object({
  id: z.string().uuid("ID de projet invalide"),
  endDate: z.coerce.date().default(() => new Date()),
});

// Schema for abandoning a project
export const abandonProjectSchema = z.object({
  id: z.string().uuid("ID de projet invalide"),
  mainReason: z.enum(abandonmentReasonValues, {
    error: "La raison principale est requise",
  }),
  secondaryReasons: z.array(z.enum(abandonmentReasonValues)).optional(),
  retrospective: z
    .string()
    .max(5000, "La rétrospective ne peut pas dépasser 5000 caractères")
    .optional()
    .nullable(),
  lessonsLearned: z
    .string()
    .max(2000, "Les leçons apprises ne peuvent pas dépasser 2000 caractères")
    .optional()
    .nullable(),
});

// Schema for reviving a project
export const reviveProjectSchema = z.object({
  id: z.string().uuid("ID de projet invalide"),
  note: z
    .string()
    .max(1000, "La note ne peut pas dépasser 1000 caractères")
    .optional()
    .nullable(),
});

// Schema for deleting a project
export const deleteProjectSchema = z.object({
  id: z.string().uuid("ID de projet invalide"),
});

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CompleteProjectInput = z.infer<typeof completeProjectSchema>;
export type AbandonProjectInput = z.infer<typeof abandonProjectSchema>;
export type ReviveProjectInput = z.infer<typeof reviveProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
