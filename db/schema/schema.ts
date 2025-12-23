import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

/* ==========================
   ENUMS
========================== */

export const projectStatusEnum = pgEnum("project_status", [
  "ACTIVE",
  "COMPLETED",
  "ABANDONED",
]);

export const abandonmentReasonEnum = pgEnum("abandonment_reason", [
  "TIME",
  "MOTIVATION",
  "TECHNICAL",
  "SCOPE",
  "MARKET",
  "ORGANIZATION",
  "BURNOUT",
  "OTHER",
]);

/* ==========================
   PROJECTS
========================== */

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  imageUrl: text("image_url"),
  repositoryUrl: text("repository_url"),
  liveUrl: text("live_url"),

  status: projectStatusEnum("status").default("ACTIVE").notNull(),

  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  abandonedAt: timestamp("abandoned_at", { withTimezone: true }),

  isPublic: boolean("is_public").default(false).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ==========================
   TAGS
========================== */

export const projectTags = pgTable("project_tags", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  label: varchar("label", { length: 50 }).notNull(),
});

/* ==========================
   ABANDONMENTS
========================== */

export const projectAbandonments = pgTable("project_abandonments", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectId: uuid("project_id")
    .notNull()
    .unique()
    .references(() => projects.id, { onDelete: "cascade" }),

  mainReason: abandonmentReasonEnum("main_reason").notNull(),
  secondaryReasons: abandonmentReasonEnum("secondary_reasons").array(),

  retrospective: text("retrospective"),
  lessonsLearned: text("lessons_learned"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ==========================
   REVIVALS (OPTIONAL)
========================== */

export const projectRevivals = pgTable("project_revivals", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  revivedAt: timestamp("revived_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  note: text("note"),
});

/* ==========================
   RELATIONS
========================== */

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(user, {
    fields: [projects.userId],
    references: [user.id],
  }),
  tags: many(projectTags),
  abandonment: one(projectAbandonments),
  revivals: many(projectRevivals),
}));

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectTags.projectId],
    references: [projects.id],
  }),
}));

export const projectAbandonmentsRelations = relations(
  projectAbandonments,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectAbandonments.projectId],
      references: [projects.id],
    }),
  }),
);

export const projectRevivalsRelations = relations(
  projectRevivals,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectRevivals.projectId],
      references: [projects.id],
    }),
  }),
);
