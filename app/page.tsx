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

const features = [
  {
    icon: FolderKanban,
    title: "Project Collection",
    description:
      "Organize all your projects in one place with descriptions, links, and images.",
  },
  {
    icon: History,
    title: "Lifecycle Tracking",
    description:
      "Track project status from active to completed or abandoned with full history.",
  },
  {
    icon: Lightbulb,
    title: "Abandonment Analysis",
    description:
      "Document why projects were abandoned and learn from your decisions.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Get insights on completion rates, common issues, and project patterns.",
  },
  {
    icon: Tags,
    title: "Tags & Organization",
    description:
      "Tag projects by technology, domain, or any custom category you need.",
  },
  {
    icon: CheckCircle2,
    title: "Revival Tracking",
    description:
      "Revive abandoned projects and track the history of stop/start cycles.",
  },
];

const LandingPage = async () => {
  const session = await getSession();

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
                <span className="text-sm font-medium">
                  Project Lifecycle Tracker
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Track, Analyze & Learn from{" "}
                <span className="text-primary">Your Projects</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Archive helps you collect, organize, and analyze your personal
                projects. Understand why projects succeed or fail and improve
                your future work.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    <Github className="h-5 w-5" />
                    Continue with GitHub
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                  >
                    Learn More
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
                Everything you need to manage your projects
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From tracking active projects to analyzing why some were
                abandoned, Archive provides the tools you need for continuous
                improvement.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
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
                  Ready to organize your projects?
                </h2>
                <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                  Start tracking your projects today and gain insights into your
                  development journey.
                </p>
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Github className="h-5 w-5" />
                    Get Started with GitHub
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
                © {new Date().getFullYear()} Archive. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
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
