import { Trans, useLingui } from "@lingui/react/macro";
import { APACHE_LICENSE_TEXT, OPEN_SOURCE_NOTICE } from "@rakazo/core/open-source-notice";
import { Button, Dialog, DialogClose, DialogContent, DialogTitle } from "@rakazo/ui-web";
import { XIcon } from "lucide-react";
import { useState } from "react";

/** Apache-2.0 attribution and license text, as Settings presents it. */
export function OpenSourceLicensesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLingui();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(80vh,40rem)] w-[min(40rem,calc(100vw-2rem))] flex-col gap-4 overflow-hidden p-6"
        aria-describedby={undefined}
      >
        <div className="flex items-start justify-between gap-4">
          <DialogTitle className="text-heading2 font-medium text-foreground">
            <Trans>Open-source licenses</Trans>
          </DialogTitle>
          <DialogClose
            aria-label={t`Close`}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <XIcon className="size-4" />
          </DialogClose>
        </div>
        <p className="text-body text-foreground">
          <Trans>Wea is built on Rakazo, open-source under the Apache License, Version 2.0.</Trans>
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border bg-muted/40 p-3">
          <pre className="whitespace-pre-wrap font-sans text-body-sm text-muted-foreground">
            {`${OPEN_SOURCE_NOTICE}\n\n${APACHE_LICENSE_TEXT}`}
          </pre>
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            <Trans>Close</Trans>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Low-key Settings footer that keeps attribution reachable without a menu row. */
export function OpenSourceLicensesLink() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="text-body-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        onClick={() => setOpen(true)}
      >
        <Trans>Open-source licenses</Trans>
      </button>
      <OpenSourceLicensesDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
