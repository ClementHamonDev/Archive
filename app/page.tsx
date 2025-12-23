import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Archive,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FolderKanban,
  Github,
  History,
  Lightbulb,
  Tags,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

const featureKeys = [
  { icon: FolderKanban, key: "projectCollection" },
  { icon: History, key: "lifecycleTracking" },
  { icon: Lightbulb, key: "abandonmentAnalysis" },
  { icon: BarChart3, key: "analytics" },
  { icon: Tags, key: "tags" },
  { icon: CheckCircle2, key: "revivalTracking" },
];

const LandingPage = async () => {
  const session = await getSession();
  const t = await getTranslations("landing");

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated={false} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Archive className="h-4 w-4" />
                <span className="text-sm font-medium">{t("tagline")}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                {t("heroTitle")}{" "}
                <span className="text-primary">{t("heroTitleHighlight")}</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("heroDescription")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    <Github className="h-5 w-5" />
                    {t("ctaGithub")}
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                  >
                    {t("ctaLearnMore")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t("featuresTitle")} {t("featuresSubtitle")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("featuresDescription")}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureKeys.map((feature) => (
                <Card key={feature.key} className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">
                      {t(`features.${feature.key}.title`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {t(`features.${feature.key}.description`)}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {t("ctaTitle")}
                </h2>
                <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                  {t("ctaDescription")}
                </p>
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Github className="h-5 w-5" />
                    {t("ctaGetStarted")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Archive. {t("footer.rights")}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("footer.terms")}
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
