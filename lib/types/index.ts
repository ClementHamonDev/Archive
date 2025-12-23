/**
 * Standardized action response types
 */

export type ActionSuccess<T> = {
  success: true;
  data: T;
};

export type ActionError = {
  success: false;
  error: string;
  code?: string;
};

export type ActionResult<T> = ActionSuccess<T> | ActionError;

/**
 * Helper functions to create responses
 */
export function success<T>(data: T): ActionSuccess<T> {
  return { success: true, data };
}

export function error(message: string, code?: string): ActionError {
  return { success: false, error: message, code };
}

/**
 * Project types
 */
export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ABANDONED";

export type AbandonmentReason =
  | "TIME"
  | "MOTIVATION"
  | "TECHNICAL"
  | "SCOPE"
  | "MARKET"
  | "ORGANIZATION"
  | "BURNOUT"
  | "OTHER";

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  repositoryUrl: string | null;
  liveUrl: string | null;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date | null;
  abandonedAt: Date | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectWithTags extends Project {
  tags: ProjectTag[];
}

export interface ProjectTag {
  id: string;
  projectId: string;
  label: string;
}

export interface ProjectAbandonment {
  id: string;
  projectId: string;
  mainReason: AbandonmentReason;
  secondaryReasons: AbandonmentReason[] | null;
  retrospective: string | null;
  lessonsLearned: string | null;
  createdAt: Date;
}

export interface ProjectRevival {
  id: string;
  projectId: string;
  revivedAt: Date;
  note: string | null;
}

export interface ProjectWithRelations extends Project {
  tags: ProjectTag[];
  abandonment: ProjectAbandonment | null;
  revivals: ProjectRevival[];
}

/**
 * Stats types
 */
export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  abandoned: number;
  completionRate: number;
}

/**
 * Analytics types
 */
export interface MonthlyActivityData {
  month: string;
  created: number;
  completed: number;
  abandoned: number;
}

export interface AbandonmentReasonStat {
  reason: AbandonmentReason;
  count: number;
  percentage: number;
}

export interface TagStat {
  name: string;
  count: number;
}

export interface TagSuccessRate {
  name: string;
  total: number;
  completed: number;
  rate: number;
}

export interface ProjectAnalytics {
  stats: ProjectStats;
  monthlyActivity: MonthlyActivityData[];
  abandonmentReasons: AbandonmentReasonStat[];
  topTags: TagStat[];
  tagSuccessRates: TagSuccessRate[];
  keyMetrics: {
    projectsStartedThisYear: number;
    projectsCompletedThisYear: number;
    revivalSuccessRate: number;
    avgTimeToAbandonDays: number | null;
  };
}
