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
import { fr } from "date-fns/locale";

const statusConfig = {
  ACTIVE: {
    label: "Actif",
    variant: "default" as const,
    icon: Play,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  COMPLETED: {
    label: "Terminé",
    variant: "secondary" as const,
    icon: CheckCircle2,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  ABANDONED: {
    label: "Abandonné",
    variant: "destructive" as const,
    icon: Pause,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

const abandonmentReasonLabels: Record<string, string> = {
  TIME: "Manque de temps",
  MOTIVATION: "Perte de motivation",
  TECHNICAL: "Difficultés techniques",
  SCOPE: "Scope trop large",
  MARKET: "Plus de marché",
  ORGANIZATION: "Problèmes d'organisation",
  BURNOUT: "Burnout",
  OTHER: "Autre",
};

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const session = await getSession();

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

  const timeline: Array<{
    date: Date;
    event: string;
    type: "created" | "milestone" | "abandoned" | "revival" | "update";
  }> = [
    {
      date: project.createdAt,
      event: "Projet créé",
      type: "created",
    },
  ];

  if (project.status === "COMPLETED" && project.endDate) {
    timeline.unshift({
      date: project.endDate,
      event: "Projet terminé",
      type: "milestone",
    });
  }

  if (project.status === "ABANDONED" && project.abandonedAt) {
    timeline.unshift({
      date: project.abandonedAt,
      event: "Projet abandonné",
      type: "abandoned",
    });
  }

  project.revivals.forEach((revival) => {
    timeline.unshift({
      date: revival.revivedAt,
      event: revival.note || "Projet relancé",
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
          Retour aux projets
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
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Commencé le{" "}
                        {format(new Date(project.startDate), "d MMMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        {project.isPublic ? (
                          <>
                            <Eye className="h-4 w-4" />
                            Public
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Privé
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
                        Modifier
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
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-muted-foreground">
                    {project.description || "Aucune description fournie."}
                  </p>
                </div>

                {project.tags.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Technologies
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
                          Voir le code
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
                          Voir en ligne
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
                    Analyse d&apos;abandon
                  </CardTitle>
                  <CardDescription>
                    Comprendre pourquoi ce projet a été abandonné
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Raison principale
                    </h4>
                    <Badge variant="destructive">
                      {abandonmentReasonLabels[project.abandonment.mainReason]}
                    </Badge>
                  </div>

                  {project.abandonment.secondaryReasons &&
                    project.abandonment.secondaryReasons.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Raisons secondaires
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.abandonment.secondaryReasons.map(
                            (reason) => (
                              <Badge key={reason} variant="outline">
                                {abandonmentReasonLabels[reason]}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {project.abandonment.retrospective && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Rétrospective
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
                        Leçons apprises
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {project.abandonment.lessonsLearned}
                      </p>
                    </div>
                  )}

                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Prêt à reprendre ce projet ?
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Relancer le projet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.status === "ACTIVE" && (
                  <>
                    <Button className="w-full gap-2" variant="default">
                      <CheckCircle2 className="h-4 w-4" />
                      Marquer comme terminé
                    </Button>
                    <Button className="w-full gap-2" variant="outline">
                      <Pause className="h-4 w-4" />
                      Abandonner le projet
                    </Button>
                  </>
                )}
                {project.status === "COMPLETED" && (
                  <Button className="w-full gap-2" variant="outline">
                    <Play className="h-4 w-4" />
                    Réactiver le projet
                  </Button>
                )}
                {project.status === "ABANDONED" && (
                  <Button className="w-full gap-2" variant="default">
                    <RotateCcw className="h-4 w-4" />
                    Relancer le projet
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historique
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
                            locale: fr,
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
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Créé le</span>
                  <span>
                    {format(new Date(project.createdAt), "d MMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mis à jour le</span>
                  <span>
                    {format(new Date(project.updatedAt), "d MMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
                {project.endDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terminé le</span>
                    <span>
                      {format(new Date(project.endDate), "d MMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                )}
                {project.abandonedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Abandonné le</span>
                    <span>
                      {format(new Date(project.abandonedAt), "d MMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                )}
                {project.revivals.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Nombre de relances
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
