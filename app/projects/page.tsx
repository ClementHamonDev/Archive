import { Header } from "@/components/header";
import { ProjectCard, ProjectStatus } from "@/components/project-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getProjects } from "@/lib/actions/projects";
import { redirect } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  FolderKanban,
  Pause,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = {
    name: session.user.name || "User",
    email: session.user.email,
    image: session.user.image || undefined,
  };

  // Fetch real projects
  const projectsResult = await getProjects();
  const projects = projectsResult.success ? projectsResult.data : [];

  const activeProjects = projects.filter((p) => p.status === "ACTIVE");
  const completedProjects = projects.filter((p) => p.status === "COMPLETED");
  const abandonedProjects = projects.filter((p) => p.status === "ABANDONED");

  // Get all unique tags
  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.tags.map((t) => t.label)))
  );

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
            <h1 className="text-3xl font-bold">Projets</h1>
            <p className="text-muted-foreground">
              Gérez et organisez tous vos projets
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau projet
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Aucun projet"
            description="Créez votre premier projet pour commencer à suivre votre travail"
            action={{
              label: "Créer un projet",
              href: "/projects/new",
            }}
          />
        ) : (
          <>
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher des projets..." className="pl-9" />
              </div>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="completed">Terminés</SelectItem>
                    <SelectItem value="abandoned">Abandonnés</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Plus récents</SelectItem>
                    <SelectItem value="oldest">Plus anciens</SelectItem>
                    <SelectItem value="name">Nom A-Z</SelectItem>
                    <SelectItem value="name-desc">Nom Z-A</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="default" className="cursor-pointer">
                  Tous
                </Badge>
                {allTags.slice(0, 8).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                  >
                    {tag}
                  </Badge>
                ))}
                {allTags.length > 8 && (
                  <Badge variant="outline" className="cursor-pointer">
                    +{allTags.length - 8}
                  </Badge>
                )}
              </div>
            )}

            {/* Projects Tabs */}
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Tous ({projects.length})
                </TabsTrigger>
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

              <TabsContent value="all">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      {...toProjectCardProps(project)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="active">
                {activeProjects.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        {...toProjectCardProps(project)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun projet actif</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="completed">
                {completedProjects.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        {...toProjectCardProps(project)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Aucun projet terminé
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="abandoned">
                {abandonedProjects.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {abandonedProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        {...toProjectCardProps(project)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Pause className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Aucun projet abandonné
                    </p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
