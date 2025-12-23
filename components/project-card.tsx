import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  CheckCircle2,
  ExternalLink,
  Github,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ABANDONED";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  thumbnail?: string;
  tags?: string[];
  repoUrl?: string;
  liveUrl?: string;
  startDate: string;
  endDate?: string;
  abandonedDate?: string;
}

const statusConfig: Record<
  ProjectStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ElementType;
  }
> = {
  ACTIVE: { label: "Active", variant: "default", icon: Play },
  COMPLETED: { label: "Completed", variant: "secondary", icon: CheckCircle2 },
  ABANDONED: { label: "Abandoned", variant: "destructive", icon: Pause },
};

export function ProjectCard({
  id,
  name,
  description,
  status,
  thumbnail,
  tags = [],
  repoUrl,
  liveUrl,
  startDate,
}: ProjectCardProps) {
  const { label, variant, icon: StatusIcon } = statusConfig[status];

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <Archive className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {/* Status Badge */}
        <Badge variant={variant} className="absolute top-3 left-3 gap-1">
          <StatusIcon className="h-3 w-3" />
          {label}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1">
            <Link href={`/projects/${id}`} className="hover:underline">
              {name}
            </Link>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href={`/projects/${id}/edit`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {status === "ABANDONED" && (
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <RotateCcw className="h-4 w-4" />
                  Revive
                </DropdownMenuItem>
              )}
              {status === "ACTIVE" && (
                <>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Pause className="h-4 w-4" />
                    Abandon
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-2 border-t">
        <span className="text-xs text-muted-foreground">
          Started{" "}
          {new Date(startDate).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
        <div className="flex items-center gap-1">
          {repoUrl && (
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button>
          )}
          {liveUrl && (
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// Compact version for lists
export function ProjectCardCompact({
  id,
  name,
  description,
  status,
  tags = [],
  startDate,
}: ProjectCardProps) {
  const { label, variant, icon: StatusIcon } = statusConfig[status];

  return (
    <Card className="group transition-all hover:shadow-md hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/projects/${id}`}
                className="font-semibold hover:underline truncate"
              >
                {name}
              </Link>
              <Badge variant={variant} className="gap-1 shrink-0">
                <StatusIcon className="h-3 w-3" />
                {label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {description}
            </p>
            <div className="flex items-center gap-2">
              {tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              <span className="text-xs text-muted-foreground">
                Started {new Date(startDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
