import { Header } from "@/components/header";
import { StatsCard } from "@/components/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  FolderKanban,
  Pause,
  PieChart,
  Play,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const abandonmentReasons = [
  { reason: "Lost interest", count: 5, percentage: 35 },
  { reason: "Too complex", count: 3, percentage: 21 },
  { reason: "Time constraints", count: 3, percentage: 21 },
  { reason: "Better alternative found", count: 2, percentage: 14 },
  { reason: "Technical blockers", count: 1, percentage: 7 },
];

const monthlyData = [
  { month: "Jan", created: 2, completed: 1, abandoned: 0 },
  { month: "Feb", created: 3, completed: 2, abandoned: 1 },
  { month: "Mar", created: 1, completed: 1, abandoned: 0 },
  { month: "Apr", created: 2, completed: 0, abandoned: 1 },
  { month: "May", created: 4, completed: 2, abandoned: 1 },
  { month: "Jun", created: 2, completed: 1, abandoned: 0 },
];

const topTags = [
  { name: "React", count: 8 },
  { name: "TypeScript", count: 7 },
  { name: "Next.js", count: 5 },
  { name: "Node.js", count: 4 },
  { name: "Tailwind", count: 4 },
  { name: "PostgreSQL", count: 3 },
];

export default async function AnalyticsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = {
    name: session.user.name || "User",
    email: session.user.email,
    image: session.user.image || undefined,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} isAuthenticated={true} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Insights and statistics about your projects
            </p>
          </div>
          <Select defaultValue="year">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Projects"
            value={24}
            icon={FolderKanban}
            trend={{ value: 12, label: "vs last period", positive: true }}
          />
          <StatsCard
            title="Completion Rate"
            value="62%"
            icon={CheckCircle2}
            trend={{ value: 5, label: "vs last period", positive: true }}
          />
          <StatsCard
            title="Avg. Duration"
            value="4.2 mo"
            icon={Calendar}
            description="From start to completion"
          />
          <StatsCard
            title="Active Projects"
            value={6}
            icon={Play}
            trend={{ value: 2, label: "new this month", positive: true }}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="abandonment" className="gap-2">
              <Pause className="h-4 w-4" />
              Abandonment
            </TabsTrigger>
            <TabsTrigger value="tags" className="gap-2">
              <PieChart className="h-4 w-4" />
              Tags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Monthly Activity Chart (Visual representation) */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Activity</CardTitle>
                  <CardDescription>
                    Projects created, completed, and abandoned over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((data) => (
                      <div key={data.month} className="flex items-center gap-4">
                        <span className="w-10 text-sm text-muted-foreground">
                          {data.month}
                        </span>
                        <div className="flex-1 flex gap-1">
                          <div
                            className="h-8 bg-blue-500 rounded-l"
                            style={{ width: `${data.created * 30}px` }}
                            title={`Created: ${data.created}`}
                          />
                          <div
                            className="h-8 bg-green-500"
                            style={{ width: `${data.completed * 30}px` }}
                            title={`Completed: ${data.completed}`}
                          />
                          <div
                            className="h-8 bg-red-400 rounded-r"
                            style={{ width: `${data.abandoned * 30}px` }}
                            title={`Abandoned: ${data.abandoned}`}
                          />
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-500">{data.created}</span>
                          <span className="text-green-500">
                            {data.completed}
                          </span>
                          <span className="text-red-400">{data.abandoned}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-6 mt-6 pt-4 border-t justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded" />
                      <span className="text-sm text-muted-foreground">
                        Created
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded" />
                      <span className="text-sm text-muted-foreground">
                        Completed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded" />
                      <span className="text-sm text-muted-foreground">
                        Abandoned
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>
                    Current project status breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-green-500" />
                      <span>Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">6</span>
                      <span className="text-muted-foreground text-sm">25%</span>
                    </div>
                  </div>
                  <Progress value={25} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">15</span>
                      <span className="text-muted-foreground text-sm">62%</span>
                    </div>
                  </div>
                  <Progress value={62} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pause className="h-4 w-4 text-red-500" />
                      <span>Abandoned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">3</span>
                      <span className="text-muted-foreground text-sm">13%</span>
                    </div>
                  </div>
                  <Progress value={13} className="h-2" />
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                  <CardDescription>Performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Projects Started This Year
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">14</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Projects Completed This Year
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">7</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Revival Success Rate
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">67%</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Avg. Time to Abandon
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">2.3 mo</span>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="abandonment">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Abandonment Reasons */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Abandonment Reasons</CardTitle>
                  <CardDescription>Why projects were abandoned</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {abandonmentReasons.map((item, index) => (
                    <div key={item.reason} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm w-4">
                            {index + 1}.
                          </span>
                          <span>{item.reason}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.count}</span>
                          <span className="text-muted-foreground text-sm">
                            ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Abandonment Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Insights</CardTitle>
                  <CardDescription>
                    Patterns and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">🎯 Key Finding</h4>
                    <p className="text-sm text-muted-foreground">
                      Projects without clear milestones are 2.5x more likely to
                      be abandoned.
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">⏰ Timing Pattern</h4>
                    <p className="text-sm text-muted-foreground">
                      Most abandonments happen in the 2nd month. Consider
                      setting early checkpoints.
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">💡 Recommendation</h4>
                    <p className="text-sm text-muted-foreground">
                      Break large projects into smaller deliverables to improve
                      completion rate.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tags">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Used Technologies</CardTitle>
                  <CardDescription>Tags across all projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topTags.map((tag, index) => (
                      <div key={tag.name} className="flex items-center gap-4">
                        <span className="text-muted-foreground text-sm w-4">
                          {index + 1}
                        </span>
                        <Badge variant="secondary" className="min-w-[100px]">
                          {tag.name}
                        </Badge>
                        <div className="flex-1">
                          <Progress
                            value={(tag.count / topTags[0].count) * 100}
                            className="h-2"
                          />
                        </div>
                        <span className="font-semibold">{tag.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tag Distribution by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Technology Success Rate</CardTitle>
                  <CardDescription>
                    Completion rate by technology
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Next.js</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-semibold">
                          85%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          completion
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">React</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-semibold">
                          72%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          completion
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Python</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-600 font-semibold">
                          58%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          completion
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">React Native</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-semibold">40%</span>
                        <span className="text-sm text-muted-foreground">
                          completion
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
