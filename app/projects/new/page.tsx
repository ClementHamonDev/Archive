"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Archive,
  ArrowLeft,
  Calendar,
  Eye,
  EyeOff,
  Github,
  Globe,
  Link2,
  Loader2,
  Plus,
  Save,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createProject } from "@/lib/actions/projects";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

const suggestedTags = [
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "Python",
  "Vue.js",
  "Tailwind",
  "PostgreSQL",
  "MongoDB",
  "GraphQL",
];

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("projectForm");
  const tCommon = useTranslations("common");

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        image: session.user.image || undefined,
      }
    : null;

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = (formData.get("status") as string) || "ACTIVE";
    const startDate = formData.get("startDate") as string;
    const repositoryUrl = formData.get("repositoryUrl") as string;
    const liveUrl = formData.get("liveUrl") as string;

    startTransition(async () => {
      const result = await createProject({
        name,
        description: description || null,
        status: status as "ACTIVE" | "COMPLETED" | "ABANDONED",
        startDate: new Date(startDate),
        isPublic,
        tags,
        repositoryUrl: repositoryUrl || null,
        liveUrl: liveUrl || null,
      });

      if (result.success) {
        router.push(`/projects/${result.data.id}`);
      } else {
        setError(result.error);
      }
    });
  };

  if (isSessionPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user!} isAuthenticated={true} />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToProjects")}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("newTitle")}</h1>
          <p className="text-muted-foreground">{t("newSubtitle")}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                {t("sections.general.title")}
              </CardTitle>
              <CardDescription>
                {t("sections.general.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fields.name.label")} *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder={t("fields.name.placeholder")}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("fields.description.label")}
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={t("fields.description.placeholder")}
                  rows={4}
                  disabled={isPending}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">{t("fields.status.label")}</Label>
                  <Select
                    name="status"
                    defaultValue="ACTIVE"
                    disabled={isPending}
                  >
                    <SelectTrigger id="status">
                      <SelectValue
                        placeholder={t("fields.status.placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        {tCommon("statuses.active")}
                      </SelectItem>
                      <SelectItem value="COMPLETED">
                        {tCommon("statuses.completed")}
                      </SelectItem>
                      <SelectItem value="ABANDONED">
                        {tCommon("statuses.abandoned")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="startDate"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    {t("fields.startDate.label")} *
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="visibility"
                    className="flex items-center gap-2"
                  >
                    {isPublic ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    {t("fields.visibility.label")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isPublic
                      ? t("fields.visibility.public")
                      : t("fields.visibility.private")}
                  </p>
                </div>
                <Switch
                  id="visibility"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                {t("sections.links.title")}
              </CardTitle>
              <CardDescription>
                {t("sections.links.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="repositoryUrl"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  {t("fields.repositoryUrl.label")}
                </Label>
                <Input
                  id="repositoryUrl"
                  name="repositoryUrl"
                  type="url"
                  placeholder={t("fields.repositoryUrl.placeholder")}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="liveUrl" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t("fields.liveUrl.label")}
                </Label>
                <Input
                  id="liveUrl"
                  name="liveUrl"
                  type="url"
                  placeholder={t("fields.liveUrl.placeholder")}
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {t("sections.tags.title")}
              </CardTitle>
              <CardDescription>
                {t("sections.tags.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                        disabled={isPending}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder={t("sections.tags.addPlaceholder")}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  disabled={isPending || tags.length >= 10}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addTag(tagInput)}
                  disabled={isPending || tags.length >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {suggestedTags.filter((tag) => !tags.includes(tag)).length >
                0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("sections.tags.suggestions")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags
                      .filter((tag) => !tags.includes(tag))
                      .slice(0, 8)
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => !isPending && addTag(tag)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link href="/projects">
              <Button
                variant="outline"
                type="button"
                className="w-full sm:w-auto"
                disabled={isPending}
              >
                {tCommon("cancel")}
              </Button>
            </Link>
            <Button
              type="submit"
              className="gap-2 w-full sm:w-auto"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("creating")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("createButton")}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
