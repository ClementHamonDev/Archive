"use client";

import { useState, useMemo } from "react";
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
import { Card } from "@/components/ui/card";
import {
  Activity,
  CheckCircle2,
  FolderKanban,
  Pause,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  imageUrl: string | null;
  tags: { id: string; projectId: string; label: string }[];
  repositoryUrl: string | null;
  liveUrl: string | null;
  startDate: Date;
  endDate: Date | null;
  abandonedAt: Date | null;
}

interface ProjectsListProps {
  projects: ProjectData[];
  allTags: string[];
}

type SortOption = "newest" | "oldest" | "name" | "name-desc";

export function ProjectsList({ projects, allTags }: ProjectsListProps) {
  const t = useTranslations("projects");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.label.toLowerCase().includes(query)),
      );
    }

    // Tag filter
    if (selectedTag) {
      result = result.filter((p) =>
        p.tags.some((tag) => tag.label === selectedTag),
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [projects, searchQuery, sortBy, selectedTag]);

  const activeProjects = filteredProjects.filter((p) => p.status === "ACTIVE");
  const completedProjects = filteredProjects.filter(
    (p) => p.status === "COMPLETED",
  );
  const abandonedProjects = filteredProjects.filter(
    (p) => p.status === "ABANDONED",
  );

  // Helper to convert project to ProjectCard props
  const toProjectCardProps = (project: ProjectData) => ({
    id: project.id,
    name: project.name,
    description: project.description || undefined,
    status: project.status,
    thumbnail: project.imageUrl || undefined,
    tags: project.tags.map((t) => t.label),
    repoUrl: project.repositoryUrl || undefined,
    liveUrl: project.liveUrl || undefined,
    startDate: new Date(project.startDate).toISOString().split("T")[0],
    endDate: project.endDate
      ? new Date(project.endDate).toISOString().split("T")[0]
      : undefined,
    abandonedDate: project.abandonedAt
      ? new Date(project.abandonedAt).toISOString().split("T")[0]
      : undefined,
  });

  const renderProjectGrid = (projectList: ProjectData[]) => {
    if (projectList.length === 0) {
      return (
        <Card className="p-12 text-center">
          <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("noProjects.title")}</p>
        </Card>
      );
    }

    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectList.map((project) => (
          <ProjectCard key={project.id} {...toProjectCardProps(project)} />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("filters.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("filters.newest")}</SelectItem>
              <SelectItem value="oldest">{t("filters.oldest")}</SelectItem>
              <SelectItem value="name">{t("filters.nameAsc")}</SelectItem>
              <SelectItem value="name-desc">{t("filters.nameDesc")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge
            variant={selectedTag === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedTag(null)}
          >
            {t("filters.all")}
          </Badge>
          {allTags.slice(0, 8).map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent"
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
          {allTags.length > 8 && (
            <Badge variant="outline" className="cursor-pointer">
              +{allTags.length - 8}
            </Badge>
          )}
        </div>
      )}

      {/* Projects Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <FolderKanban className="h-4 w-4" />
            {t("tabs.all")} ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <Activity className="h-4 w-4" />
            {t("tabs.active")} ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {t("tabs.completed")} ({completedProjects.length})
          </TabsTrigger>
          <TabsTrigger value="abandoned" className="gap-2">
            <Pause className="h-4 w-4" />
            {t("tabs.abandoned")} ({abandonedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderProjectGrid(filteredProjects)}
        </TabsContent>

        <TabsContent value="active">
          {activeProjects.length > 0 ? (
            renderProjectGrid(activeProjects)
          ) : (
            <Card className="p-12 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("status.active")}</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedProjects.length > 0 ? (
            renderProjectGrid(completedProjects)
          ) : (
            <Card className="p-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("status.completed")}</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="abandoned">
          {abandonedProjects.length > 0 ? (
            renderProjectGrid(abandonedProjects)
          ) : (
            <Card className="p-12 text-center">
              <Pause className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("status.abandoned")}</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
