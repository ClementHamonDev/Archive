import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Archive,
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
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock data
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  image: "https://github.com/shadcn.png",
};

const mockProject = {
  id: "1",
  name: "E-commerce Platform",
  description:
    "A full-featured e-commerce platform with React and Node.js. Includes user authentication, product catalog, shopping cart, and payment integration with Stripe. The platform supports multiple payment methods, inventory management, and order tracking.",
  status: "ACTIVE" as const,
  visibility: "PUBLIC",
  thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200",
  tags: ["React", "Node.js", "MongoDB", "Stripe", "Redux", "Express"],
  repoUrl: "https://github.com",
  liveUrl: "https://example.com",
  startDate: "2024-01-15",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-12-20T14:45:00Z",
};

const mockTimeline = [
  {
    date: "2024-12-20",
    event: "Updated project description",
    type: "update",
  },
  {
    date: "2024-11-15",
    event: "Added payment integration",
    type: "milestone",
  },
  {
    date: "2024-09-01",
    event: "Completed user authentication",
    type: "milestone",
  },
  {
    date: "2024-06-15",
    event: "Added Redux for state management",
    type: "update",
  },
  {
    date: "2024-01-15",
    event: "Project created",
    type: "created",
  },
];

const statusConfig = {
  ACTIVE: {
    label: "Active",
    variant: "default" as const,
    icon: Play,
    color: "text-green-600",
  },
  COMPLETED: {
    label: "Completed",
    variant: "secondary" as const,
    icon: CheckCircle2,
    color: "text-blue-600",
  },
  ABANDONED: {
    label: "Abandoned",
    variant: "destructive" as const,
    icon: Pause,
    color: "text-red-600",
  },
};

export default async function ProjectDetailPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = {
    name: session.user.name || "User",
    email: session.user.email,
    image: session.user.image || undefined,
  };

  const {
    label,
    variant,
    icon: StatusIcon,
    color,
  } = statusConfig[mockProject.status];

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} isAuthenticated={true} />

      <main className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {/* Hero Section */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          {mockProject.thumbnail ? (
            <div className="relative aspect-[3/1] w-full">
              <Image
                src={mockProject.thumbnail}
                alt={mockProject.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>
          ) : (
            <div className="aspect-[3/1] w-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
              <Archive className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Project Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={variant} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {label}
                  </Badge>
                  <Badge variant="outline">{mockProject.visibility}</Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {mockProject.name}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {mockProject.repoUrl && (
                  <Button variant="secondary" size="sm" asChild>
                    <a
                      href={mockProject.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Repository
                    </a>
                  </Button>
                )}
                {mockProject.liveUrl && (
                  <Button variant="secondary" size="sm" asChild>
                    <a
                      href={mockProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {mockProject.description}
                </p>
              </CardContent>
            </Card>

            {/* Tabs: Timeline, Abandonment Analysis, Revivals */}
            <Tabs defaultValue="timeline">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="timeline" className="gap-2">
                  <History className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="analysis" className="gap-2">
                  <Archive className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="revivals" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Revivals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Timeline</CardTitle>
                    <CardDescription>
                      History of updates and milestones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {mockTimeline.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`h-3 w-3 rounded-full ${
                                item.type === "created"
                                  ? "bg-green-500"
                                  : item.type === "milestone"
                                    ? "bg-blue-500"
                                    : "bg-muted-foreground"
                              }`}
                            />
                            {index < mockTimeline.length - 1 && (
                              <div className="w-px h-full bg-border mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <p className="font-medium">{item.event}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Abandonment Analysis
                    </CardTitle>
                    <CardDescription>
                      This project is currently active. Analysis will be
                      available if the project is abandoned.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No abandonment data available for active projects</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="revivals" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revival History</CardTitle>
                    <CardDescription>
                      Track stop/start cycles for this project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No revival history for this project</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href={`/projects/${mockProject.id}/edit`}
                  className="block"
                >
                  <Button variant="outline" className="w-full gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Project
                  </Button>
                </Link>
                <Button variant="outline" className="w-full gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Completed
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-orange-600 hover:text-orange-600"
                >
                  <Pause className="h-4 w-4" />
                  Abandon Project
                </Button>
                <Separator className="my-4" />
                <Button
                  variant="ghost"
                  className="w-full gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Project
                </Button>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Started</p>
                    <p className="font-medium">
                      {new Date(mockProject.startDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="font-medium">
                      {new Date(mockProject.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Play className={`h-4 w-4 ${color}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">11 months active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockProject.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress (mock) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
                <CardDescription>Estimated completion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Milestones</p>
                    <p className="font-medium">3/4 completed</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tasks</p>
                    <p className="font-medium">18/24 done</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
