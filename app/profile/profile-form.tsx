"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Mail, MapPin, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateProfile } from "./actions";
import { useTransition } from "react";
import { toast } from "sonner";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    location?: string | null;
    website?: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations("profile.form");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t("fullName")}</Label>
          <Input id="name" name="name" defaultValue={user.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {t("email")}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t("location")}
          </Label>
          <Input
            id="location"
            name="location"
            defaultValue={user.location ?? ""}
            placeholder={t("locationPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            {t("website")}
          </Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={user.website ?? ""}
            placeholder={t("websitePlaceholder")}
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button type="submit" className="gap-2" disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending ? t("saving") : t("saveChanges")}
        </Button>
      </div>
    </form>
  );
}
