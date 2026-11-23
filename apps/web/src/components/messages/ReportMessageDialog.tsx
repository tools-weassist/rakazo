import { Trans, useLingui } from "@lingui/react/macro";
import type { ContentReportReason } from "@rakazo/contracts";
import { CONTENT_REPORT_DETAILS_MAX_LENGTH } from "@rakazo/contracts";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldLabel,
  RadioGroup,
  RadioGroupItem,
  Textarea,
  toast,
} from "@rakazo/ui-web";
import { useId, useState } from "react";
import { useSave } from "../../lib/query/query";
import { errorText } from "../../lib/query/user-error";

export type ReportMessageTarget = ({ botId: string } | { groupId: string }) & {
  messageId: string;
};

/** Reports a bot's message as offensive or harmful to the people who run Wea. */
export function ReportMessageDialog({
  target,
  onClose,
}: {
  target: ReportMessageTarget | null;
  onClose: () => void;
}) {
  const { t } = useLingui();
  const detailsId = useId();
  const [reason, setReason] = useState<ContentReportReason | null>(null);
  const [details, setDetails] = useState("");
  const report = useSave({
    save: (
      input: { target: ReportMessageTarget; reason: ContentReportReason; details: string },
      rpc,
    ) =>
      rpc.threads.report({
        ...input.target,
        reason: input.reason,
        ...(input.details.trim() ? { details: input.details.trim() } : {}),
      }),
    closesScreen: true,
    onSaved: () => {
      toast(t`Thanks for reporting. The Wea team will review this message.`);
      close();
    },
  });
  const sending = report.pending;
  function close() {
    setReason(null);
    setDetails("");
    report.reset();
    onClose();
  }
  const reasons: readonly { value: ContentReportReason; title: string; detail: string }[] = [
    {
      value: "offensive",
      title: t`Offensive`,
      detail: t`Hateful, harassing, sexual or otherwise offensive`,
    },
    {
      value: "harmful",
      title: t`Harmful or unsafe`,
      detail: t`Dangerous advice, scams or content that could hurt someone`,
    },
    { value: "other", title: t`Something else`, detail: t`Tell us more below` },
  ];

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(next) => {
        if (!next && !sending) close();
      }}
    >
      <DialogContent data-testid="report-message-dialog">
        <DialogHeader>
          <DialogTitle>
            <Trans>Report message</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Reports go to the Wea team. The bot isn't told.</Trans>
          </DialogDescription>
        </DialogHeader>
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault();
            if (target && reason) report.run({ target, reason, details });
          }}
        >
          <RadioGroup
            aria-label={t`Why are you reporting this message?`}
            value={reason}
            disabled={sending}
            onValueChange={(value) => setReason(value as ContentReportReason)}
            className="gap-0.5"
          >
            {reasons.map((option) => (
              // biome-ignore lint/a11y/noLabelWithoutControl: the radio inside is the control.
              <label
                key={option.value}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-[5px] hover:bg-foreground/[0.04] has-data-checked:bg-foreground/[0.06] has-disabled:cursor-default"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-body">{option.title}</span>
                  <span className="text-label text-foreground/60">{option.detail}</span>
                </span>
                <RadioGroupItem value={option.value} className="me-1.5" />
              </label>
            ))}
          </RadioGroup>
          <Field>
            <FieldLabel htmlFor={detailsId}>
              <Trans>Details (optional)</Trans>
            </FieldLabel>
            <Textarea
              id={detailsId}
              rows={3}
              maxLength={CONTENT_REPORT_DETAILS_MAX_LENGTH}
              placeholder={t`What was wrong with it?`}
              value={details}
              disabled={sending}
              onChange={(event) => setDetails(event.target.value)}
            />
            <FieldError>
              {report.error
                ? errorText(report.error, t`Could not send the report. Try again.`)
                : null}
            </FieldError>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={sending} onClick={close}>
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" disabled={sending || !reason}>
              <Trans>Send report</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
