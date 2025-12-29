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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Download, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteAllProjects, deleteAccount, exportUserData } from "./actions";

export function DangerZone() {
  const t = useTranslations("settings.danger");
  const [isExporting, startExport] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isDeletingAccount, startDeleteAccount] = useTransition();

  const handleExport = () => {
    startExport(async () => {
      const result = await exportUserData();
      if (result.success && result.data) {
        // Télécharger les données en JSON
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `archive-export-${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Data exported successfully");
      } else {
        toast.error(result.error || "Failed to export data");
      }
    });
  };

  const handleDeleteAllProjects = () => {
    startDelete(async () => {
      const result = await deleteAllProjects();
      if (result.success) {
        toast.success("All projects deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete projects");
      }
    });
  };

  const handleDeleteAccount = () => {
    startDeleteAccount(async () => {
      const result = await deleteAccount();
      if (result.success === false) {
        toast.error(result.error || "Failed to delete account");
      }
      // Si succès, redirection gérée par l'action serveur
    });
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Data */}
        <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg">
          <div className="space-y-0.5">
            <Label>{t("export.label")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("export.description")}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? t("export.exporting") : t("export.button")}
          </Button>
        </div>

        {/* Delete All Projects */}
        <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg">
          <div className="space-y-0.5">
            <Label>{t("deleteProjects.label")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("deleteProjects.description")}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                {t("deleteProjects.button")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteProjects.confirm")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllProjects}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? t("deleteProjects.deleting") : "Delete All"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
          <div className="space-y-0.5">
            <Label>{t("deleteAccount.label")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("deleteAccount.description")}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                {t("deleteAccount.button")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">
                  Delete Account
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteAccount.confirm")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount
                    ? t("deleteAccount.deleting")
                    : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
