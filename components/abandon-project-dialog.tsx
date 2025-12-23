"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { abandonProject } from "@/lib/actions/projects";
import { abandonmentReasonValues } from "@/lib/validations/project";
import { Loader2, Pause } from "lucide-react";

interface AbandonProjectDialogProps {
  projectId: string;
  projectName: string;
  trigger?: React.ReactNode;
}

const reasonKeys: Record<string, string> = {
  TIME: "time",
  MOTIVATION: "motivation",
  TECHNICAL: "technical",
  SCOPE: "scope",
  MARKET: "market",
  ORGANIZATION: "organization",
  BURNOUT: "burnout",
  OTHER: "other",
};

export function AbandonProjectDialog({
  projectId,
  projectName,
  trigger,
}: AbandonProjectDialogProps) {
  const router = useRouter();
  const t = useTranslations("project.abandon");
  const tReasons = useTranslations("project.abandonment.reasons");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [mainReason, setMainReason] = useState<string>("");
  const [secondaryReasons, setSecondaryReasons] = useState<string[]>([]);
  const [retrospective, setRetrospective] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");

  const handleSecondaryReasonToggle = (reason: string) => {
    if (reason === mainReason) return;
    setSecondaryReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason],
    );
  };

  const handleSubmit = () => {
    if (!mainReason) return;

    setError(null);
    startTransition(async () => {
      const result = await abandonProject({
        id: projectId,
        mainReason: mainReason as (typeof abandonmentReasonValues)[number],
        secondaryReasons:
          secondaryReasons.length > 0
            ? (secondaryReasons as (typeof abandonmentReasonValues)[number][])
            : undefined,
        retrospective: retrospective || null,
        lessonsLearned: lessonsLearned || null,
      });

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const resetForm = () => {
    setMainReason("");
    setSecondaryReasons([]);
    setRetrospective("");
    setLessonsLearned("");
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full gap-2">
            <Pause className="h-4 w-4" />
            {t("confirm").replace(" le projet", "")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { name: projectName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mainReason">{t("mainReason")} *</Label>
            <Select value={mainReason} onValueChange={setMainReason}>
              <SelectTrigger>
                <SelectValue placeholder={t("mainReasonPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {abandonmentReasonValues.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {tReasons(reasonKeys[reason])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mainReason && (
            <div className="space-y-2">
              <Label>{t("secondaryReasons")}</Label>
              <div className="flex flex-wrap gap-2">
                {abandonmentReasonValues
                  .filter((r) => r !== mainReason)
                  .map((reason) => (
                    <Button
                      key={reason}
                      type="button"
                      variant={
                        secondaryReasons.includes(reason)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleSecondaryReasonToggle(reason)}
                    >
                      {tReasons(reasonKeys[reason])}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="retrospective">{t("retrospective")}</Label>
            <Textarea
              id="retrospective"
              value={retrospective}
              onChange={(e) => setRetrospective(e.target.value)}
              placeholder={t("retrospectivePlaceholder")}
              rows={3}
              maxLength={5000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessonsLearned">{t("lessonsLearned")}</Label>
            <Textarea
              id="lessonsLearned"
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              placeholder={t("lessonsLearnedPlaceholder")}
              rows={3}
              maxLength={2000}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isPending || !mainReason}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("abandoning")}
              </>
            ) : (
              t("confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
