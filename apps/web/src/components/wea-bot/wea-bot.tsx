import { useTimeout } from "@rakazo/chat-ui/hooks";
import { useEffect, useRef } from "react";
import type { WeaBotLook } from "../../pages/landing/motion/animated-bot.js";
import { WeaBot } from "../../pages/landing/motion/animated-bot.js";
import "../../pages/landing/motion/wea-bots.css";
import { CHIEF_LOOK } from "./chief-look";

WeaBot.BOTS.chief ??= CHIEF_LOOK;

/** The face a bot template wears on the landing page, or undefined when it has none. */
export function weaBotLook(kind: string): WeaBotLook | undefined {
  return Object.hasOwn(WeaBot.BOTS, kind) ? WeaBot.BOTS[kind] : undefined;
}

/**
 * One animated Wea bot face from the landing page's animated-bot.js. Without a `label` it is
 * decorative and hidden from screen readers. `greet` plays a happy hop shortly after it appears.
 */
export function WeaBotFace({
  kind,
  size,
  label,
  greet = false,
  className,
}: {
  kind: string;
  size: number;
  label?: string;
  greet?: boolean;
  className?: string;
}) {
  const host = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const svg = WeaBot.create(kind, { size, label });
    if (label === undefined) svg.setAttribute("aria-hidden", "true");
    element.replaceChildren(svg);
    return () => svg.remove();
  }, [kind, size, label]);
  useTimeout(
    () => {
      const svg = host.current?.firstElementChild ?? null;
      WeaBot.mood(svg, "happy");
      WeaBot.hop(svg);
    },
    greet ? 500 : null,
  );
  useTimeout(
    () => WeaBot.mood(host.current?.firstElementChild ?? null, "idle"),
    greet ? 1800 : null,
  );
  return (
    <span
      ref={host}
      className={className}
      style={{ display: "inline-block", width: size, height: size, flex: "none" }}
    />
  );
}
