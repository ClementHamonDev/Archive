"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function GeneralSettings() {
  const t = useTranslations("settings.general");
  const tFormats = useTranslations("settings.dateFormats");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [language, setLanguage] = useState(locale);
  const [dateFormat, setDateFormat] = useState("dmy");
  const [defaultVisibility, setDefaultVisibility] = useState("private");

  const handleSave = () => {
    startTransition(() => {
      // Changer la langue si différente
      if (language !== locale) {
        document.cookie = `NEXT_LOCALE=${language}; path=/; max-age=31536000`;
        router.refresh();
      }

      // Sauvegarder les autres préférences (à implémenter avec une action serveur si nécessaire)
      toast.success("Settings saved successfully");
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("language.label")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("language.description")}
            </p>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("dateFormat.label")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("dateFormat.description")}
            </p>
          </div>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mdy">{tFormats("mdy")}</SelectItem>
              <SelectItem value="dmy">{tFormats("dmy")}</SelectItem>
              <SelectItem value="ymd">{tFormats("ymd")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("defaultVisibility.label")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("defaultVisibility.description")}
            </p>
          </div>
          <Select
            value={defaultVisibility}
            onValueChange={setDefaultVisibility}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">
                {t("defaultVisibility.private")}
              </SelectItem>
              <SelectItem value="public">
                {t("defaultVisibility.public")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="gap-2" disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? t("saving") : t("saveChanges")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
