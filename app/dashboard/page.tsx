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

// Mock data - à remplacer par les vraies données
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  image: "https://github.com/shadcn.png",
};

const mockProjects = [
  {
    id: "1",
    name: "E-commerce Platform",
    description: "A full-featured e-commerce platform with React and Node.js",
    status: "ACTIVE" as ProjectStatus,
    thumbnail:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    tags: ["React", "Node.js", "MongoDB"],
    repoUrl: "https://github.com",
    liveUrl: "https://example.com",
    startDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Task Management App",
    description: "A Kanban-style task management application",
    status: "COMPLETED" as ProjectStatus,
    tags: ["Next.js", "Prisma", "PostgreSQL"],
    repoUrl: "https://github.com",
    startDate: "2023-08-01",
    endDate: "2023-12-15",
  },
  {
    id: "3",
    name: "Weather Dashboard",
    description: "Real-time weather data visualization dashboard",
    status: "ABANDONED" as ProjectStatus,
    tags: ["Vue.js", "D3.js"],
    startDate: "2024-03-01",
    abandonedDate: "2024-05-15",
  },
  {
    id: "4",
    name: "Portfolio Website",
    description: "Personal portfolio showcasing projects and skills",
    status: "ACTIVE" as ProjectStatus,
    thumbnail:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800",
    tags: ["Astro", "Tailwind"],
    repoUrl: "https://github.com",
    startDate: "2024-06-01",
  },
];

const recentActivity = [
  { type: "created", project: "Portfolio Website", date: "2 hours ago" },
  { type: "completed", project: "Task Management App", date: "3 days ago" },
  { type: "abandoned", project: "Weather Dashboard", date: "1 week ago" },
  { type: "updated", project: "E-commerce Platform", date: "2 weeks ago" },
];

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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name}! Here&apos;s an overview of your
              projects.
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Projects"
            value={mockProjects.length}
            icon={FolderKanban}
            trend={{ value: 12, label: "from last month", positive: true }}
          />
          <StatsCard
            title="Active"
            value={activeProjects.length}
            icon={Activity}
            description="Currently in progress"
          />
          <StatsCard
            title="Completed"
            value={completedProjects.length}
            icon={CheckCircle2}
            trend={{ value: 8, label: "completion rate", positive: true }}
          />
          <StatsCard
            title="Abandoned"
            value={abandonedProjects.length}
            icon={Pause}
            description="Paused or stopped"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="active" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
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
                <Link href="/projects">
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              </div>

              <TabsContent value="active" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {activeProjects.map((project) => (
                    <ProjectCard key={project.id} {...project} />
                  ))}
                </div>
                {activeProjects.length === 0 && (
                  <Card className="p-8 text-center">
                    <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active projects</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {completedProjects.map((project) => (
                    <ProjectCard key={project.id} {...project} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="abandoned" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {abandonedProjects.map((project) => (
                    <ProjectCard key={project.id} {...project} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Completion Rate
                  </span>
                  <span className="font-semibold">
                    {Math.round(
                      (completedProjects.length / mockProjects.length) * 100,
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(completedProjects.length / mockProjects.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">
                    Avg. Project Duration
                  </span>
                  <span className="font-semibold">3.5 months</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Projects This Year
                  </span>
                  <span className="font-semibold">8</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Your latest project updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2 w-2 rounded-full ${
                          activity.type === "created"
                            ? "bg-blue-500"
                            : activity.type === "completed"
                              ? "bg-green-500"
                              : activity.type === "abandoned"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="capitalize">{activity.type}</span>{" "}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
