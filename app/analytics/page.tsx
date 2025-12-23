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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/auth";
import { getProjectAnalytics } from "@/lib/actions/projects";
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
  AlertCircle,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { AbandonmentReason } from "@/lib/types";

const reasonTranslationKeys: Record<AbandonmentReason, string> = {
  TIME: "time",
  MOTIVATION: "motivation",
  TECHNICAL: "technical",
  SCOPE: "scope",
  MARKET: "market",
  ORGANIZATION: "organization",
  BURNOUT: "burnout",
  OTHER: "other",
};

export default async function AnalyticsPage() {
  const session = await getSession();
  const t = await getTranslations("analytics");
  const tCommon = await getTranslations("common");
  const tMonths = await getTranslations("months");
  const tReasons = await getTranslations("project.abandonment.reasons");

  if (!session) {
    redirect("/login");
  }

  const user = {
    name: session.user.name || "User",
    email: session.user.email,
    image: session.user.image || undefined,
  };

  const analyticsResult = await getProjectAnalytics();

  if (!analyticsResult.success) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} isAuthenticated={true} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{analyticsResult.error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const analytics = analyticsResult.data;
  const {
    stats,
    monthlyActivity,
    abandonmentReasons,
    topTags,
    tagSuccessRates,
    keyMetrics,
  } = analytics;

  // Format average time to abandon
  const formatTimeToAbandon = (days: number | null): string => {
    if (days === null) return "-";
    if (days < 30) return `${days}d`;
    const months = Math.round(days / 30);
    return `${months} mo`;
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
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title={t("stats.totalProjects")}
            value={stats.total}
            icon={FolderKanban}
          />
          <StatsCard
            title={t("stats.completionRate")}
            value={`${stats.completionRate}%`}
            icon={CheckCircle2}
          />
          <StatsCard
            title={t("stats.avgDuration")}
            value={formatTimeToAbandon(keyMetrics.avgTimeToAbandonDays)}
            icon={Calendar}
            description={t("stats.avgDurationDescription")}
          />
          <StatsCard
            title={t("stats.activeProjects")}
            value={stats.active}
            icon={Play}
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
              {/* Monthly Activity Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t("monthlyActivity.title")}</CardTitle>
                  <CardDescription>
                    {t("monthlyActivity.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyActivity.some(
                    (d) => d.created > 0 || d.completed > 0 || d.abandoned > 0,
                  ) ? (
                    <>
                      <div className="space-y-4">
                        {monthlyActivity.map((data) => (
                          <div
                            key={data.month}
                            className="flex items-center gap-4"
                          >
                            <span className="w-10 text-sm text-muted-foreground">
                              {tMonths(data.month)}
                            </span>
                            <div className="flex-1 flex gap-1">
                              <div
                                className="h-8 bg-blue-500 rounded-l"
                                style={{
                                  width: `${Math.max(data.created * 30, data.created > 0 ? 8 : 0)}px`,
                                }}
                                title={`${t("monthlyActivity.created")}: ${data.created}`}
                              />
                              <div
                                className="h-8 bg-green-500"
                                style={{
                                  width: `${Math.max(data.completed * 30, data.completed > 0 ? 8 : 0)}px`,
                                }}
                                title={`${t("monthlyActivity.completed")}: ${data.completed}`}
                              />
                              <div
                                className="h-8 bg-red-400 rounded-r"
                                style={{
                                  width: `${Math.max(data.abandoned * 30, data.abandoned > 0 ? 8 : 0)}px`,
                                }}
                                title={`${t("monthlyActivity.abandoned")}: ${data.abandoned}`}
                              />
                            </div>
                            <div className="flex gap-4 text-sm min-w-[80px]">
                              <span className="text-blue-500">
                                {data.created}
                              </span>
                              <span className="text-green-500">
                                {data.completed}
                              </span>
                              <span className="text-red-400">
                                {data.abandoned}
                              </span>
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
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activity in the last 6 months</p>
                    </div>
                  )}
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
                      <span className="font-semibold">{stats.active}</span>
                      <span className="text-muted-foreground text-sm">
                        {stats.total > 0
                          ? Math.round((stats.active / stats.total) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      stats.total > 0 ? (stats.active / stats.total) * 100 : 0
                    }
                    className="h-2"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>{tCommon("statuses.completed")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stats.completed}</span>
                      <span className="text-muted-foreground text-sm">
                        {stats.total > 0
                          ? Math.round((stats.completed / stats.total) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      stats.total > 0
                        ? (stats.completed / stats.total) * 100
                        : 0
                    }
                    className="h-2"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pause className="h-4 w-4 text-red-500" />
                      <span>{tCommon("statuses.abandoned")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stats.abandoned}</span>
                      <span className="text-muted-foreground text-sm">
                        {stats.total > 0
                          ? Math.round((stats.abandoned / stats.total) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      stats.total > 0
                        ? (stats.abandoned / stats.total) * 100
                        : 0
                    }
                    className="h-2"
                  />
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
                      <span className="font-semibold text-lg">
                        {keyMetrics.projectsStartedThisYear}
                      </span>
                      {keyMetrics.projectsStartedThisYear > 0 && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("keyMetrics.projectsCompleted")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {keyMetrics.projectsCompletedThisYear}
                      </span>
                      {keyMetrics.projectsCompletedThisYear > 0 && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("keyMetrics.revivalSuccessRate")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {keyMetrics.revivalSuccessRate}%
                      </span>
                      {keyMetrics.revivalSuccessRate >= 50 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : keyMetrics.revivalSuccessRate > 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("keyMetrics.avgTimeToAbandon")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {formatTimeToAbandon(keyMetrics.avgTimeToAbandonDays)}
                      </span>
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
                  {abandonmentReasons.length > 0 ? (
                    abandonmentReasons.map((item, index) => (
                      <div key={item.reason} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm w-4">
                              {index + 1}.
                            </span>
                            <span>
                              {tReasons(reasonTranslationKeys[item.reason])}
                            </span>
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
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No abandoned projects yet</p>
                    </div>
                  )}
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
                  {topTags.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tags yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tag Success Rate */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("techSuccessRate.title")}</CardTitle>
                  <CardDescription>
                    {t("techSuccessRate.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tagSuccessRates.length > 0 ? (
                    <div className="space-y-4">
                      {tagSuccessRates.map((tag) => (
                        <div
                          key={tag.name}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{tag.name}</Badge>
                            <span className="text-xs text-muted-foreground">
                              ({tag.completed}/{tag.total})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                tag.rate >= 70
                                  ? "text-green-600"
                                  : tag.rate >= 50
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {tag.rate}%
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {t("techSuccessRate.completion")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Need at least 2 projects per tag</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
