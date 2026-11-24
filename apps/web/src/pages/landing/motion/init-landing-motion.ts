// @ts-expect-error plain JS motion module
import { WeaBot } from "./animated-bot.js";
// @ts-expect-error plain JS motion module
import { WeaChat } from "./chat-demo.js";
// @ts-expect-error plain JS motion module
import { initReveal } from "./reveal.js";
// @ts-expect-error plain JS motion module
import { WeaTeam } from "./team-showcase.js";

/** Mount Brandi's motion pass on the landing root. Returns a cleanup function. */
export function initLandingMotion(root: HTMLElement): () => void {
  if (!root || typeof window === "undefined") return () => {};

  WeaBot.mount(root);
  const chats: Array<{ stop?: () => void }> = [];
  root.querySelectorAll("[data-wea-chat]").forEach((el) => {
    chats.push(
      WeaChat.mount(el, {
        mark: el.getAttribute("data-mark") || "/landing/wea-mark-light.svg",
        startDelay: 1200,
      }),
    );
  });
  WeaTeam.mount(root);
  const stopReveal = initReveal(root) as () => void;

  return () => {
    for (const state of chats) {
      state.stop?.();
    }
    stopReveal?.();
    WeaBot.destroy?.();
  };
}
