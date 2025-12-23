import { Header } from "@/components/header";
import { EmptyState } from "@/components/empty-state";
import { ProjectsList } from "@/components/projects-list";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getProjects } from "@/lib/actions/projects";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FolderKanban, Plus } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const t = await getTranslations("projects");

  const user = {
    name: session.user.name || "User",
    email: session.user.email,
    image: session.user.image || undefined,
  };

  // Fetch real projects
  const projectsResult = await getProjects();
  const projects = projectsResult.success ? projectsResult.data : [];

  // Get all unique tags
  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.tags.map((t) => t.label))),
  );

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} isAuthenticated={true} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Link href="/projects/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("newProject")}
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={t("noProjects.title")}
            description={t("noProjects.description")}
            action={{
              label: t("noProjects.action"),
              href: "/projects/new",
            }}
          />
        ) : (
          <ProjectsList projects={projects} allTags={allTags} />
        )}
      </main>
    </div>
  );
}
