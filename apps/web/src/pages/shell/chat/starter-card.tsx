import { useTimeout } from "@rakazo/chat-ui/hooks";
import type { MessageBlock } from "@rakazo/contracts";
import { TEAM_TEMPLATES } from "@rakazo/core";
import { Button } from "@rakazo/ui-web";
import { useState } from "react";
import { WeaBotFace, weaBotLook } from "../../../components/wea-bot/wea-bot";

type ChoiceBlock = Extract<MessageBlock, { kind: "choice" }>;

/** Chief types for a moment before the first starter card of this visit. */
let introduced = false;

/** The bot templates a starter option would set up: the bot itself, or every team member. */
function starterBots(block: ChoiceBlock): string[] {
  for (const option of block.options) {
    const [, kind, id] = option.id.split(":");
    if (kind === "bot" && id) return [id];
    if (kind === "team" && id) {
      return TEAM_TEMPLATES.find((team) => team.id === id)?.members.map((m) => m.templateId) ?? [];
    }
  }
  return [];
}

/**
 * Chief's starter card in the first chat: the recommended bot or team with each bot's face and
 * job, and the answers as quick reply chips. The server's question and options are shown as sent.
 */
export function StarterCard({
  block,
  disabled,
  onChoose,
}: {
  block: ChoiceBlock;
  disabled: boolean;
  onChoose: (optionId: string) => void;
}) {
  const reduced =
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [typing, setTyping] = useState(!block.answerId && !introduced && !reduced);
  useTimeout(
    () => {
      introduced = true;
      setTyping(false);
    },
    typing ? 900 : null,
  );
  if (typing) return <StarterTyping />;

  const bots = starterBots(block).flatMap((kind) => {
    const look = weaBotLook(kind);
    return look ? [{ kind, look }] : [];
  });
  return (
    <div>
      <div className="pe-8 text-body-lg font-medium text-foreground">{block.question}</div>
      {block.subtitle ? (
        <div className="mt-0.5 text-body-sm text-foreground/75">{block.subtitle}</div>
      ) : null}
      {bots.length ? (
        <ul className="mt-3 divide-y divide-border">
          {bots.map(({ kind, look }) => (
            <li key={kind} className="flex items-center gap-3 py-2">
              <WeaBotFace kind={kind} size={36} />
              <span className="min-w-0 text-body-sm">
                <span className="block text-foreground">{look.name}</span>
                {look.job ? <span className="block text-muted-foreground">{look.job}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {block.options.map((option) => (
          <Button
            key={option.id}
            variant={block.answerId === option.id ? "default" : "outline"}
            className="rounded-full"
            disabled={Boolean(block.answerId) || disabled}
            onClick={() => onChoose(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

/** Three typing dots, shown while Chief's card is on its way. */
function StarterTyping() {
  return (
    <div className="flex gap-1 py-1" aria-hidden>
      {[0, 150, 300].map((delay) => (
        <i
          key={delay}
          className="size-2 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}
