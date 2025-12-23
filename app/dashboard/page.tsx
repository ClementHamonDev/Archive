import { Header } from "@/components/header";
import { StatsCard } from "@/components/stats-card";
import { ProjectCard, ProjectStatus } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSession } from "@/lib/auth";
import { getProjects, getProjectStats } from "@/lib/actions/projects";
import { redirect } from "next/navigation";
import {
  Activity,
  Archive,
  CheckCircle2,
  FolderKanban,
  Pause,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = {
    name: session.user.name || "User",
    email: session.user.email,
    image: session.user.image || undefined,
  };

  // Fetch real data
  const [projectsResult, statsResult] = await Promise.all([
    getProjects(),
    getProjectStats(),
  ]);

  const projects = projectsResult.success ? projectsResult.data : [];
  const stats = statsResult.success
    ? statsResult.data
    : { total: 0, active: 0, completed: 0, abandoned: 0, completionRate: 0 };

  const activeProjects = projects.filter((p) => p.status === "ACTIVE");
  const completedProjects = projects.filter((p) => p.status === "COMPLETED");
  const abandonedProjects = projects.filter((p) => p.status === "ABANDONED");

  // Build recent activity from projects
  const recentActivity = projects
    .map((project) => {
      if (project.status === "ABANDONED" && project.abandonedAt) {
        return {
          type: "abandoned" as const,
          project: project.name,
          date: formatDistanceToNow(new Date(project.abandonedAt), {
            addSuffix: true,
            locale: fr,
          }),
          timestamp: new Date(project.abandonedAt),
        };
      }
      if (project.status === "COMPLETED" && project.endDate) {
        return {
          type: "completed" as const,
          project: project.name,
          date: formatDistanceToNow(new Date(project.endDate), {
            addSuffix: true,
            locale: fr,
          }),
          timestamp: new Date(project.endDate),
        };
      }
      return {
        type: "created" as const,
        project: project.name,
        date: formatDistanceToNow(new Date(project.createdAt), {
          addSuffix: true,
          locale: fr,
        }),
        timestamp: new Date(project.createdAt),
      };
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  // Helper to convert project to ProjectCard props
  const toProjectCardProps = (project: (typeof projects)[0]) => ({
    id: project.id,
    name: project.name,
    description: project.description || undefined,
    status: project.status as ProjectStatus,
    thumbnail: project.imageUrl || undefined,
    tags: project.tags.map((t) => t.label),
    repoUrl: project.repositoryUrl || undefined,
    liveUrl: project.liveUrl || undefined,
    startDate: project.startDate.toISOString().split("T")[0],
    endDate: project.endDate?.toISOString().split("T")[0],
    abandonedDate: project.abandonedAt?.toISOString().split("T")[0],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} isAuthenticated={true} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenue {user.name} ! Voici un aperçu de vos projets.
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau projet
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Projets"
            value={stats.total}
            icon={FolderKanban}
          />
          <StatsCard
            title="Actifs"
            value={stats.active}
            icon={Activity}
            description="En cours"
          />
          <StatsCard
            title="Terminés"
            value={stats.completed}
            icon={CheckCircle2}
            trend={
              stats.total > 0
                ? {
                    value: stats.completionRate,
                    label: "taux de complétion",
                    positive: stats.completionRate >= 50,
                  }
                : undefined
            }
          />
          <StatsCard
            title="Abandonnés"
            value={stats.abandoned}
            icon={Pause}
            description="En pause ou arrêtés"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            {projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="Aucun projet"
                description="Commencez par créer votre premier projet pour suivre vos idées et votre progression."
                action={{
                  label: "Créer un projet",
                  href: "/projects/new",
                }}
              />
            ) : (
              <Tabs defaultValue="active" className="space-y-4">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="active" className="gap-2">
                      <Activity className="h-4 w-4" />
                      Actifs ({activeProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Terminés ({completedProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="abandoned" className="gap-2">
                      <Pause className="h-4 w-4" />
                      Abandonnés ({abandonedProjects.length})
                    </TabsTrigger>
                  </TabsList>
                  <Link href="/projects">
                    <Button variant="ghost" size="sm">
                      Voir tout
                    </Button>
                  </Link>
                </div>

                <TabsContent value="active" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {activeProjects.slice(0, 4).map((project) => (
                      <ProjectCard
                        key={project.id}
                        {...toProjectCardProps(project)}
                      />
                    ))}
                  </div>
                  {activeProjects.length === 0 && (
                    <Card className="p-8 text-center">
                      <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Aucun projet actif
                      </p>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {completedProjects.slice(0, 4).map((project) => (
                      <ProjectCard
                        key={project.id}
                        {...toProjectCardProps(project)}
                      />
                    ))}
                  </div>
                  {completedProjects.length === 0 && (
                    <Card className="p-8 text-center">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Aucun projet terminé
                      </p>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="abandoned" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {abandonedProjects.slice(0, 4).map((project) => (
                      <ProjectCard
                        key={project.id}
                        {...toProjectCardProps(project)}
                      />
                    ))}
                  </div>
                  {abandonedProjects.length === 0 && (
                    <Card className="p-8 text-center">
                      <Pause className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Aucun projet abandonné
                      </p>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Aperçu rapide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Taux de complétion
                  </span>
                  <span className="font-semibold">{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${stats.completionRate}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">
                    Projets actifs
                  </span>
                  <span className="font-semibold">{stats.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total des projets
                  </span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activité récente</CardTitle>
                <CardDescription>
                  Vos dernières mises à jour de projets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune activité récente
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div
                          className={`mt-1 h-2 w-2 rounded-full ${
                            activity.type === "created"
                              ? "bg-blue-500"
                              : activity.type === "completed"
                                ? "bg-green-500"
                                : "bg-red-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="capitalize">
                              {activity.type === "created"
                                ? "Créé"
                                : activity.type === "completed"
                                  ? "Terminé"
                                  : "Abandonné"}
                            </span>{" "}
                            <span className="font-medium">
                              {activity.project}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.date}
                          </p>
                        </div>
                      </div>
                    ))}
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
