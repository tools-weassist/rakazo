import { Trans } from "@lingui/react/macro";
import { Bell } from "lucide-react";
import { useRef } from "react";
import type { BrowserNotificationApi } from "../../lib/platform/browser-notifications";
import { requestBrowserNotificationPermission } from "../../lib/platform/browser-notifications";

function browserNotifications(): BrowserNotificationApi | undefined {
  return typeof Notification === "undefined" ? undefined : Notification;
}

/** Whether this browser can still be asked; without that, onboarding leaves the step out. */
export function canAskForNotifications(api = browserNotifications()): boolean {
  return api?.permission === "default";
}

/**
 * Offers browser notifications before the first chat. It never holds anyone up: allowing,
 * blocking, a browser without notifications and "Maybe later" all move on.
 */
export function NotificationsStep({
  onDone,
  api = browserNotifications(),
}: {
  onDone: () => void;
  api?: BrowserNotificationApi;
}) {
  const done = useRef(false);
  function finish() {
    if (done.current) return;
    done.current = true;
    onDone();
  }
  function turnOn() {
    const asked = requestBrowserNotificationPermission(api);
    if (!asked) return finish();
    void asked.then(finish, finish);
  }

  return (
    <div className="wo-enter flex min-h-[560px] flex-col">
      <h1 className="wo-question">
        <Trans>Before you start</Trans>
      </h1>
      <p className="wo-sub">
        <Trans>
          Turn on notifications so you know when a bot needs your yes, finishes a job or has a
          question.
        </Trans>
      </p>
      <div className="wo-pulse" aria-hidden>
        <i />
        <i />
        <i />
        <span className="wo-bell">
          <Bell size={38} fill="currentColor" />
        </span>
      </div>
      <div className="mt-auto">
        <button type="button" className="wo-cta" onClick={turnOn}>
          <Trans>Turn on notifications</Trans>
        </button>
        <button type="button" className="wo-link" onClick={finish}>
          <Trans>Maybe later</Trans>
        </button>
      </div>
    </div>
  );
}
