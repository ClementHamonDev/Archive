import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  CheckCircle2,
  FolderKanban,
  Github,
  Pause,
  Play,
  User,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projects } from "@/db/schema/schema";
import { account, user as userTable } from "@/db/schema/auth-schema";
import { eq, and, count } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Récupérer les données complètes de l'utilisateur depuis la base de données
  const [userData] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  if (!userData) {
    redirect("/login");
  }

  const t = await getTranslations("profile");

  // Récupérer les statistiques des projets
  const [projectStats, githubAccount] = await Promise.all([
    db
      .select({
        status: projects.status,
        count: count(),
      })
      .from(projects)
      .where(eq(projects.userId, userData.id))
      .groupBy(projects.status),
    db
      .select()
      .from(account)
      .where(
        and(eq(account.userId, userData.id), eq(account.providerId, "github")),
      )
      .limit(1)
      .then((res) => res[0]),
  ]);

  // Calculer les stats
  const stats = {
    total: 0,
    active: 0,
    completed: 0,
    abandoned: 0,
  };

  projectStats.forEach((stat) => {
    stats.total += stat.count;
    if (stat.status === "ACTIVE") stats.active = stat.count;
    if (stat.status === "COMPLETED") stats.completed = stat.count;
    if (stat.status === "ABANDONED") stats.abandoned = stat.count;
  });

  const profileStats = [
    { label: t("stats.totalProjects"), value: stats.total, icon: FolderKanban },
    { label: t("stats.active"), value: stats.active, icon: Play },
    { label: t("stats.completed"), value: stats.completed, icon: CheckCircle2 },
    { label: t("stats.abandoned"), value: stats.abandoned, icon: Pause },
  ];

  const connectedAccounts = [
    {
      provider: "GitHub",
      connected: !!githubAccount,
      username: githubAccount?.accountId || null,
      icon: Github,
    },
  ];
  const memberSince = new Date(userData.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header user={userData} isAuthenticated={true} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              {t("tabs.profile")}
            </TabsTrigger>
            <TabsTrigger value="accounts" className="gap-2">
              <Github className="h-4 w-4" />
              {t("tabs.accounts")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid gap-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("information.title")}</CardTitle>
                  <CardDescription>
                    {t("information.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={userData.image ?? undefined}
                          alt={userData.name}
                        />
                        <AvatarFallback className="text-2xl">
                          {userData.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{userData.name}</h3>
                      <p className="text-muted-foreground">{userData.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("memberSince")} {memberSince}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form */}
                  <ProfileForm user={userData} />
                </CardContent>
              </Card>

              {/* Stats Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("stats.title")}</CardTitle>
                  <CardDescription>{t("stats.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profileStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="text-center p-4 bg-muted rounded-lg"
                      >
                        <stat.icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle>{t("accounts.title")}</CardTitle>
                <CardDescription>{t("accounts.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectedAccounts.map((account) => (
                  <div
                    key={account.provider}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <account.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{account.provider}</p>
                        {account.connected && account.username && (
                          <p className="text-sm text-muted-foreground">
                            @{account.username}
                          </p>
                        )}
                      </div>
                    </div>
                    {account.connected ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("accounts.connected")}
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm">
                        {t("accounts.connect")}
                      </Button>
                    )}
                  </div>
                ))}

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t("accounts.note")}</strong>{" "}
                    {t("accounts.githubNote")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
