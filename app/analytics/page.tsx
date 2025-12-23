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
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations("analytics");
  const tCommon = await getTranslations("common");

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
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Select defaultValue="year">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("timePeriod")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t("periods.month")}</SelectItem>
              <SelectItem value="quarter">{t("periods.quarter")}</SelectItem>
              <SelectItem value="year">{t("periods.year")}</SelectItem>
              <SelectItem value="all">{t("periods.all")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title={t("stats.totalProjects")}
            value={24}
            icon={FolderKanban}
            trend={{
              value: 12,
              label: t("stats.vsLastPeriod"),
              positive: true,
            }}
          />
          <StatsCard
            title={t("stats.completionRate")}
            value="62%"
            icon={CheckCircle2}
            trend={{ value: 5, label: t("stats.vsLastPeriod"), positive: true }}
          />
          <StatsCard
            title={t("stats.avgDuration")}
            value="4.2 mo"
            icon={Calendar}
            description={t("stats.avgDurationDescription")}
          />
          <StatsCard
            title={t("stats.activeProjects")}
            value={6}
            icon={Play}
            trend={{ value: 2, label: t("stats.newThisMonth"), positive: true }}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="abandonment" className="gap-2">
              <Pause className="h-4 w-4" />
              {t("tabs.abandonment")}
            </TabsTrigger>
            <TabsTrigger value="tags" className="gap-2">
              <PieChart className="h-4 w-4" />
              {t("tabs.tags")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Monthly Activity Chart (Visual representation) */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t("monthlyActivity.title")}</CardTitle>
                  <CardDescription>
                    {t("monthlyActivity.description")}
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
                            title={`${t("monthlyActivity.created")}: ${data.created}`}
                          />
                          <div
                            className="h-8 bg-green-500"
                            style={{ width: `${data.completed * 30}px` }}
                            title={`${t("monthlyActivity.completed")}: ${data.completed}`}
                          />
                          <div
                            className="h-8 bg-red-400 rounded-r"
                            style={{ width: `${data.abandoned * 30}px` }}
                            title={`${t("monthlyActivity.abandoned")}: ${data.abandoned}`}
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
                        {t("monthlyActivity.created")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded" />
                      <span className="text-sm text-muted-foreground">
                        {t("monthlyActivity.completed")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded" />
                      <span className="text-sm text-muted-foreground">
                        {t("monthlyActivity.abandoned")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("statusDistribution.title")}</CardTitle>
                  <CardDescription>
                    {t("statusDistribution.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-green-500" />
                      <span>{tCommon("statuses.active")}</span>
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
                      <span>{tCommon("statuses.completed")}</span>
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
                      <span>{tCommon("statuses.abandoned")}</span>
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
                  <CardTitle>{t("keyMetrics.title")}</CardTitle>
                  <CardDescription>
                    {t("keyMetrics.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("keyMetrics.projectsStarted")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">14</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("keyMetrics.projectsCompleted")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">7</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("keyMetrics.revivalSuccessRate")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">67%</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("keyMetrics.avgTimeToAbandon")}
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
                  <CardTitle>{t("abandonmentReasons.title")}</CardTitle>
                  <CardDescription>
                    {t("abandonmentReasons.description")}
                  </CardDescription>
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
                  <CardTitle>{t("insights.title")}</CardTitle>
                  <CardDescription>{t("insights.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">
                      🎯 {t("insights.keyFinding.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("insights.keyFinding.description")}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">
                      ⏰ {t("insights.timingPattern.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("insights.timingPattern.description")}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">
                      💡 {t("insights.recommendation.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("insights.recommendation.description")}
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
                  <CardTitle>{t("topTags.title")}</CardTitle>
                  <CardDescription>{t("topTags.description")}</CardDescription>
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
                  <CardTitle>{t("techSuccessRate.title")}</CardTitle>
                  <CardDescription>
                    {t("techSuccessRate.description")}
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
                          {t("techSuccessRate.completion")}
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
                          {t("techSuccessRate.completion")}
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
                          {t("techSuccessRate.completion")}
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
                          {t("techSuccessRate.completion")}
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
