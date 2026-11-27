/** Types for animated-bot.js, the Wea bot faces shared by the landing page and onboarding. */
export type WeaBotLook = {
  name: string;
  job?: string;
  shape: string;
  fx: number;
  fy: number;
  fill: string;
  line: string;
  face: string;
  token?: string;
};

export declare const WeaBot: {
  BOTS: Record<string, WeaBotLook>;
  create: (kind: string, opts?: { size?: number; label?: string }) => SVGSVGElement;
  mood: (svg: Element | null, mood?: "idle" | "happy" | "working" | "waiting") => void;
  hop: (svg: Element | null) => void;
  mount: (scope?: ParentNode | Document) => void;
  destroy: () => void;
};
