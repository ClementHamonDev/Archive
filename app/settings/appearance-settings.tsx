"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export function AppearanceSettings() {
  const t = useTranslations("settings.appearance");
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("theme.label")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("theme.description")}
            </p>
          </div>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <span className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  {t("theme.light")}
                </span>
              </SelectItem>
              <SelectItem value="dark">
                <span className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  {t("theme.dark")}
                </span>
              </SelectItem>

              <SelectItem value="system">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t("theme.system")}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
