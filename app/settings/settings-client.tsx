"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Palette,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { GeneralSettings } from "./general-settings";
import { AppearanceSettings } from "./appearance-settings";
import { DangerZone } from "./danger-zone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SettingsClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const t = useTranslations("settings");
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Les paramètres sont déjà sauvegardés individuellement
    // Ce bouton sert de confirmation visuelle
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Settings saved successfully");
    setIsSaving(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} isAuthenticated={true} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-2">
            <TabsTrigger value="general" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              {t("tabs.general")}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              {t("tabs.appearance")}
            </TabsTrigger>
            <TabsTrigger
              value="danger"
              className="gap-2 text-destructive data-[state=active]:text-destructive"
            >
              <AlertTriangle className="h-4 w-4" />
              {t("tabs.danger")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="appearance">
            <AppearanceSettings />
          </TabsContent>

          <TabsContent value="danger">
            <DangerZone />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? t("general.saving") : t("general.saveChanges")}
          </Button>
        </div>
      </main>
    </div>
  );
}
