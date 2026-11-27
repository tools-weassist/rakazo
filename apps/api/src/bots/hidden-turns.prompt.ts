/** The creation intro's hidden prompt. It names only the tools this bot still has. */
export function botIntroPrompt(input: {
  userName: string;
  spaceName: string | null;
  disabledBuiltinTools: readonly string[];
}): string {
  const canAsk = !input.disabledBuiltinTools.includes("ask_user");
  const canUpdate = !input.disabledBuiltinTools.includes("update_bot");
  const byName = input.userName ? " by first name" : "";
  const options =
    "two to four short options that fit your name, anything your description or instructions already say, and what you know about them, never a stock list";
  return [
    [
      "You were just created.",
      input.userName ? `${input.userName} made you.` : undefined,
      input.spaceName ? `Their team space is called "${input.spaceName}".` : undefined,
    ]
      .filter(Boolean)
      .join(" "),
    // The greeting goes in the question itself, so the card stands on its own.
    canAsk
      ? `Call ask_user right away, with no text before it. Its question greets them${byName} in a few words and asks what they want you for, with ${options}. They can also type their own answer.`
      : `Greet them${byName} in a few words and ask in one sentence what they want you for, suggesting ${options}.`,
    "If your profile already makes that clear, say in one line what you will do instead of asking.",
    canUpdate
      ? 'Once you know what you are for, use update_bot to set what is already clear: a one-line description of what you do, your instructions on how you do it, and a short name if yours is still a placeholder like "New Bot". Leave anything vague unset to fill in later as the work becomes clearer, and otherwise keep your name and look.'
      : undefined,
    "Then get started, asking one follow-up only if you cannot start without it.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * The first turn of a bot made from a template. Its instructions already say what it is for and
 * list its setup questions, so it opens the chat with the first still-unknown of them instead of
 * waiting. Shared user memory (About me from Wea sign-up) and the user's name are already known.
 */
export function templateIntroPrompt(input: {
  userName: string;
  disabledBuiltinTools: readonly string[];
}): string {
  const canAsk = !input.disabledBuiltinTools.includes("ask_user");
  const byName = input.userName ? " by first name" : "";
  return [
    [
      "You were just created from a template.",
      input.userName ? `${input.userName} made you.` : undefined,
      "Your instructions already say what you are for, so don't ask that, and don't change your name, description or instructions.",
    ]
      .filter(Boolean)
      .join(" "),
    "Open the chat now with your first-conversation setup: one line on what you do, then the first setup question your instructions list that shared memory or their name has not already answered. Shared memory, especially the About me from Wea sign-up section, and their name if you have it, are already known: skip any question (or part of a question) they answer. If every listed setup question is already answered, give that one line and don't ask one. Ask only one question; the rest come one at a time after each answer.",
    canAsk
      ? `Call ask_user right away, with no text before it. Its question greets them${byName} in a few words, gives that one line and asks that still-unknown setup question, with two to four short options when the question has natural answers. They can also type their own answer.`
      : `Greet them${byName} in a few words, give that one line and ask that still-unknown setup question in one sentence.`,
    "If your instructions list no setup questions, ask the one thing you most need to know to start, unless shared memory already covers it.",
    "Don't start the work yet, and don't say you have done, sent or saved anything.",
  ].join("\n");
}

/** The card is closed by a marker; the run that follows finishes whatever the call left open. */
export const HANG_UP_PROMPT =
  "The voice call just ended because the user hung up. First call end_call with a short title for the call (leave farewell empty). Then, if anything the user asked for during the call is still unfinished, complete it now as a normal chat reply with full formatting. If nothing is pending, reply with one short sentence.";

export function mcpConnectedPrompt(name: string): string {
  return `The user just connected the MCP server ${JSON.stringify(name)} from its approval card, so its tools are available now. Carry on with what they asked for. If nothing is left to do, confirm in one short sentence.`;
}
