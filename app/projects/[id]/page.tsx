import { Header } from "@/components/header";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/auth";
import { getProject } from "@/lib/actions/projects";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Edit,
  ExternalLink,
  Github,
  History,
  Pause,
  Play,
  RotateCcw,
  Tag,
  AlertTriangle,
  Lightbulb,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { getTranslations, getLocale } from "next-intl/server";

const statusConfig = {
  ACTIVE: {
    variant: "default" as const,
    icon: Play,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  COMPLETED: {
    variant: "secondary" as const,
    icon: CheckCircle2,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  ABANDONED: {
    variant: "destructive" as const,
    icon: Pause,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

const abandonmentReasonKeys: Record<string, string> = {
  TIME: "time",
  MOTIVATION: "motivation",
  TECHNICAL: "technical",
  SCOPE: "scope",
  MARKET: "market",
  ORGANIZATION: "organization",
  BURNOUT: "burnout",
  OTHER: "other",
};

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const session = await getSession();
  const t = await getTranslations("project");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const dateLocale = locale === "fr" ? fr : enUS;

  if (!session) {
    redirect("/login");
  }

  const user = {
    name: session.user.name || "User",
    email: session.user.email,
    image: session.user.image || undefined,
  };

  const projectResult = await getProject(id);

  if (!projectResult.success) {
    notFound();
  }

  const project = projectResult.data;
  const status = statusConfig[project.status];
  const StatusIcon = status.icon;
  const statusLabel = tCommon(`statuses.${project.status.toLowerCase()}`);

  const timeline: Array<{
    date: Date;
    event: string;
    type: "created" | "milestone" | "abandoned" | "revival" | "update";
  }> = [
    {
      date: project.createdAt,
      event: t("timeline.created"),
      type: "created",
    },
  ];

  if (project.status === "COMPLETED" && project.endDate) {
    timeline.unshift({
      date: project.endDate,
      event: t("timeline.completed"),
      type: "milestone",
    });
  }

  if (project.status === "ABANDONED" && project.abandonedAt) {
    timeline.unshift({
      date: project.abandonedAt,
      event: t("timeline.abandoned"),
      type: "abandoned",
    });
  }

  project.revivals.forEach((revival) => {
    timeline.unshift({
      date: revival.revivedAt,
      event: revival.note || t("timeline.revived"),
      type: "revival",
    });
  });

  timeline.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} isAuthenticated={true} />

      <main className="container mx-auto px-4 py-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToProjects")}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl">{project.name}</CardTitle>
                      <Badge variant={status.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusLabel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {t("startedOn")}{" "}
                        {format(new Date(project.startDate), "d MMMM yyyy", {
                          locale: dateLocale,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        {project.isPublic ? (
                          <>
                            <Eye className="h-4 w-4" />
                            {t("visibility.public")}
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4" />
                            {t("visibility.private")}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      asChild
                    >
                      <Link href={`/projects/${project.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        {tCommon("edit")}
                      </Link>
                    </Button>
                    <DeleteProjectDialog
                      projectId={project.id}
                      projectName={project.name}
                    />
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                {project.imageUrl && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6 bg-muted">
                    <Image
                      src={project.imageUrl}
                      alt={project.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold">{t("description")}</h3>
                  <p className="text-muted-foreground">
                    {project.description || t("noDescription")}
                  </p>
                </div>

                {project.tags.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      {t("technologies")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline">
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(project.repositoryUrl || project.liveUrl) && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {project.repositoryUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={project.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-2"
                        >
                          <Github className="h-4 w-4" />
                          {t("viewCode")}
                        </a>
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {t("viewLive")}
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {project.status === "ABANDONED" && project.abandonment && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    {t("abandonment.title")}
                  </CardTitle>
                  <CardDescription>{t("abandonment.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      {t("abandonment.mainReason")}
                    </h4>
                    <Badge variant="destructive">
                      {t(
                        `abandonment.reasons.${abandonmentReasonKeys[project.abandonment.mainReason]}`,
                      )}
                    </Badge>
                  </div>

                  {project.abandonment.secondaryReasons &&
                    project.abandonment.secondaryReasons.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          {t("abandonment.secondaryReasons")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.abandonment.secondaryReasons.map(
                            (reason) => (
                              <Badge key={reason} variant="outline">
                                {t(
                                  `abandonment.reasons.${abandonmentReasonKeys[reason]}`,
                                )}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {project.abandonment.retrospective && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {t("abandonment.retrospective")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {project.abandonment.retrospective}
                      </p>
                    </div>
                  )}

                  {project.abandonment.lessonsLearned && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        {t("abandonment.lessonsLearned")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {project.abandonment.lessonsLearned}
                      </p>
                    </div>
                  )}

                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t("abandonment.readyToRevive")}
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      {t("actions.revive")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("actionsTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.status === "ACTIVE" && (
                  <>
                    <Button className="w-full gap-2" variant="default">
                      <CheckCircle2 className="h-4 w-4" />
                      {t("actions.markCompleted")}
                    </Button>
                    <Button className="w-full gap-2" variant="outline">
                      <Pause className="h-4 w-4" />
                      {t("actions.abandon")}
                    </Button>
                  </>
                )}
                {project.status === "COMPLETED" && (
                  <Button className="w-full gap-2" variant="outline">
                    <Play className="h-4 w-4" />
                    {t("actions.reactivate")}
                  </Button>
                )}
                {project.status === "ABANDONED" && (
                  <Button className="w-full gap-2" variant="default">
                    <RotateCcw className="h-4 w-4" />
                    {t("actions.revive")}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  {t("history")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div
                        className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                          item.type === "created"
                            ? "bg-blue-500"
                            : item.type === "milestone"
                              ? "bg-green-500"
                              : item.type === "abandoned"
                                ? "bg-red-500"
                                : item.type === "revival"
                                  ? "bg-purple-500"
                                  : "bg-yellow-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{item.event}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.date), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("info.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("info.createdAt")}
                  </span>
                  <span>
                    {format(new Date(project.createdAt), "d MMM yyyy", {
                      locale: dateLocale,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("info.updatedAt")}
                  </span>
                  <span>
                    {format(new Date(project.updatedAt), "d MMM yyyy", {
                      locale: dateLocale,
                    })}
                  </span>
                </div>
                {project.endDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("info.completedAt")}
                    </span>
                    <span>
                      {format(new Date(project.endDate), "d MMM yyyy", {
                        locale: dateLocale,
                      })}
                    </span>
                  </div>
                )}
                {project.abandonedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("info.abandonedAt")}
                    </span>
                    <span>
                      {format(new Date(project.abandonedAt), "d MMM yyyy", {
                        locale: dateLocale,
                      })}
                    </span>
                  </div>
                )}
                {project.revivals.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("info.revivals")}
                    </span>
                    <span>{project.revivals.length}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
