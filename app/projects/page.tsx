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
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  FolderKanban,
  Grid3X3,
  LayoutList,
  Pause,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

// Mock data
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  image: "https://github.com/shadcn.png",
};

const mockProjects = [
  {
    id: "1",
    name: "E-commerce Platform",
    description:
      "A full-featured e-commerce platform with React and Node.js. Includes user authentication, product catalog, shopping cart, and payment integration.",
    status: "ACTIVE" as ProjectStatus,
    thumbnail:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    tags: ["React", "Node.js", "MongoDB", "Stripe"],
    repoUrl: "https://github.com",
    liveUrl: "https://example.com",
    startDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Task Management App",
    description:
      "A Kanban-style task management application with real-time collaboration features",
    status: "COMPLETED" as ProjectStatus,
    thumbnail:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800",
    tags: ["Next.js", "Prisma", "PostgreSQL", "WebSockets"],
    repoUrl: "https://github.com",
    startDate: "2023-08-01",
    endDate: "2023-12-15",
  },
  {
    id: "3",
    name: "Weather Dashboard",
    description:
      "Real-time weather data visualization dashboard with interactive charts and maps",
    status: "ABANDONED" as ProjectStatus,
    tags: ["Vue.js", "D3.js", "OpenWeather API"],
    startDate: "2024-03-01",
    abandonedDate: "2024-05-15",
  },
  {
    id: "4",
    name: "Portfolio Website",
    description:
      "Personal portfolio showcasing projects and skills with modern design",
    status: "ACTIVE" as ProjectStatus,
    thumbnail:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800",
    tags: ["Astro", "Tailwind", "TypeScript"],
    repoUrl: "https://github.com",
    startDate: "2024-06-01",
  },
  {
    id: "5",
    name: "Blog CMS",
    description:
      "A headless CMS for managing blog content with markdown support",
    status: "COMPLETED" as ProjectStatus,
    tags: ["Next.js", "MDX", "Vercel"],
    repoUrl: "https://github.com",
    liveUrl: "https://example.com",
    startDate: "2023-03-10",
    endDate: "2023-06-20",
  },
  {
    id: "6",
    name: "Fitness Tracker",
    description:
      "Mobile-first fitness tracking app with workout plans and progress charts",
    status: "ABANDONED" as ProjectStatus,
    tags: ["React Native", "Firebase"],
    startDate: "2024-02-01",
    abandonedDate: "2024-04-01",
  },
];

const allTags = Array.from(new Set(mockProjects.flatMap((p) => p.tags)));

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

  const activeProjects = mockProjects.filter((p) => p.status === "ACTIVE");
  const completedProjects = mockProjects.filter(
    (p) => p.status === "COMPLETED",
  );
  const abandonedProjects = mockProjects.filter(
    (p) => p.status === "ABANDONED",
  );

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} isAuthenticated={true} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              Manage and organize all your projects
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="newest">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tags Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="default" className="cursor-pointer">
            All
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
              +{allTags.length - 8} more
            </Badge>
          )}
        </div>

        {/* View Toggle & Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <FolderKanban className="h-4 w-4" />
                All ({mockProjects.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="gap-2">
                <Activity className="h-4 w-4" />
                Active ({activeProjects.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Completed ({completedProjects.length})
              </TabsTrigger>
              <TabsTrigger value="abandoned" className="gap-2">
                <Pause className="h-4 w-4" />
                Abandoned ({abandonedProjects.length})
              </TabsTrigger>
            </TabsList>
            <div className="hidden md:flex items-center gap-1 border rounded-md p-1">
              <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon-sm" className="h-7 w-7">
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="all">
            {mockProjects.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProjects.map((project) => (
                  <ProjectCard key={project.id} {...project} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={
                  <FolderKanban className="h-8 w-8 text-muted-foreground" />
                }
                title="No projects yet"
                description="Create your first project to start tracking your work"
                action={
                  <Link href="/projects/new">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Project
                    </Button>
                  </Link>
                }
              />
            )}
          </TabsContent>

          <TabsContent value="active">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="abandoned">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {abandonedProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
