declare module "./chat-demo.js" {
  export const WeaChat: {
    mount: (el: Element, opts?: { mark?: string; startDelay?: number }) => { stop?: () => void };
    SCENES: Array<{ bot: string; line: string; steps: Array<{ t: string; text?: string }> }>;
  };
}

declare module "./animated-bot.js" {
  export const WeaBot: {
    BOTS: Record<string, { name: string }>;
    mount: (scope?: ParentNode | Document) => void;
    destroy: () => void;
  };
}

declare module "./team-showcase.js" {
  export const WeaTeam: { mount: (scope?: ParentNode | Document) => void };
}

declare module "./init-landing-motion.js" {
  export function initLandingMotion(root: HTMLElement): () => void;
}

declare module "./reveal.js" {
  export function initReveal(root: HTMLElement): () => void;
}
