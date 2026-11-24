const MARK = "/landing/wea-mark-light.svg";

const PROVIDERS = [
  { key: "chatgpt", name: "ChatGPT", how: "Sign in with Plus or Pro", strip: true },
  {
    key: "githubcopilot",
    name: "GitHub Copilot",
    how: "Sign in with your Copilot plan",
    strip: true,
  },
  { key: "grok", name: "Grok", how: "Sign in with SuperGrok or X Premium", strip: true },
  { key: "claude", name: "Claude", how: "With your Anthropic key", strip: true },
  { key: "openai", name: "OpenAI", how: "Add your API key" },
  { key: "gemini", name: "Google Gemini", how: "Add your API key" },
  { key: "deepseek", name: "DeepSeek", how: "Add your API key" },
  { key: "openrouter", name: "OpenRouter", how: "Add your API key" },
  { key: "mistral", name: "Mistral", how: "Add your API key" },
  { key: "groq", name: "Groq", how: "Add your API key" },
  { key: "azure", name: "Azure OpenAI", how: "Add your API key" },
  { key: "bedrock", name: "Amazon Bedrock", how: "Add your API key" },
  { key: "vertex", name: "Vertex AI", how: "Add your API key" },
  { key: "ollama", name: "Ollama or vLLM", how: "Your own OpenAI compatible server" },
  { key: "more", name: "And more", how: "43 providers in all" },
] as const;

const TOOLS = [
  "Gmail",
  "Outlook",
  "Google Calendar",
  "Google Drive",
  "Google Docs",
  "Google Sheets",
  "Slack",
  "Microsoft Teams",
  "ClickUp",
  "Notion",
  "GitHub",
  "OneDrive",
  "SharePoint",
  "Dropbox",
  "Trello",
  "Asana",
  "Jira",
  "Linear",
  "HubSpot",
  "Salesforce",
  "Zoom",
  "Calendly",
  "Stripe",
  "Airtable",
  "Figma",
] as const;

const EXTRAS = [
  "About 1,000 apps to connect",
  "Built in web search",
  "Add MCP servers and plugins",
] as const;

type Channel = {
  key: string;
  name: string;
  status: "live" | "soon";
  line: string;
  ask?: string;
  bot?: string;
  botname?: string;
  reply?: string;
  call?: boolean;
};

const CHANNELS: Channel[] = [
  {
    key: "wea",
    name: "The Wea app",
    status: "live",
    line: "Chat with your bots and teams on web, desktop and phone.",
    ask: "Draft a reply to Maya about the weekend order",
    bot: "inbox-admin-triage",
    botname: "Inbox and admin triage",
    reply: "Draft ready for your yes",
  },
  {
    key: "voice",
    name: "Voice calls in Wea",
    status: "live",
    line: "Start a voice call with a bot inside the app and talk the work through.",
    call: true,
    bot: "morning-briefing",
    botname: "Morning briefing",
  },
  {
    key: "slack",
    name: "Slack",
    status: "soon",
    line: "Mention a bot in a channel or send it a direct message.",
  },
  {
    key: "teams",
    name: "Microsoft Teams",
    status: "soon",
    line: "Chat with your bots where your team already talks.",
  },
  {
    key: "imessage",
    name: "iMessage and SMS",
    status: "soon",
    line: "Text a bot from your phone.",
  },
  {
    key: "whatsapp",
    name: "WhatsApp",
    status: "soon",
    line: "Send a bot a message from WhatsApp.",
  },
  {
    key: "telegram",
    name: "Telegram",
    status: "soon",
    line: "Chat with a bot from Telegram.",
  },
  {
    key: "email",
    name: "Bot email address",
    status: "soon",
    line: "Give a bot its own address and forward it work.",
  },
];

function ChannelBody({ channel }: { channel: Channel }) {
  if (channel.status !== "live") return null;
  if (channel.call && channel.bot && channel.botname) {
    return (
      <div
        className="chn-chat chn-call"
        role="img"
        aria-label={`Example: a voice call with ${channel.botname}.`}
      >
        <span className="chn-callbar" aria-hidden="true">
          <span data-wea-bot={channel.bot} data-size="28" data-label={channel.botname} />
          <span className="chn-callt">
            <b>{channel.botname}</b>
            <small>Voice call</small>
          </span>
          <span className="chn-wave">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        </span>
      </div>
    );
  }
  if (channel.ask && channel.bot && channel.botname && channel.reply) {
    return (
      <div
        className="chn-chat"
        role="img"
        aria-label={`Example: you write ${channel.ask}. ${channel.botname} answers: ${channel.reply}.`}
      >
        <span className="chn-you" aria-hidden="true">
          {channel.ask}
        </span>
        <span className="chn-bot" aria-hidden="true">
          <span data-wea-bot={channel.bot} data-size="22" data-label={channel.botname} />
          <span className="chn-reply">{channel.reply}</span>
        </span>
      </div>
    );
  }
  return null;
}

export function ConnectSections() {
  const strip = PROVIDERS.filter((provider) => "strip" in provider && provider.strip);
  return (
    <>
      <section className="sec byo wea-sec" id="connect">
        <div className="wea-wrap">
          <div className="wea-center" data-reveal="">
            <h2>Bring your own AI and tools</h2>
            <p className="wea-lead">
              Bring the AI provider you already use. Sign in with your ChatGPT, GitHub Copilot or
              SuperGrok plan, or add your own key for Claude, Gemini, DeepSeek and more. Then
              connect the apps your work lives in.
            </p>
          </div>
          <div className="byo-link" data-connect="" aria-hidden="true">
            <span className="byo-plan">
              {strip.map((provider) => (
                <span className="byo-plan-item" data-plan={provider.name} key={provider.name}>
                  <b>{provider.name}</b>
                </span>
              ))}
            </span>
            <span className="byo-track">
              <i className="byo-token" />
            </span>
            <span className="byo-wea">
              <img src={MARK} alt="" width={28} height={28} />
              <b>Wea</b>
            </span>
            <span className="byo-state">
              <i />
              <span className="byo-state-t">Connected</span>
            </span>
          </div>
          <div className="byo-group">
            <h3>Your AI provider</h3>
            <p className="byo-sub">
              Sign in with a plan you already pay for, add an API key from one of 43 providers, or
              point Wea at your own OpenAI compatible server.
            </p>
            <ul className="byo-grid byo-ai" data-reveal-group="">
              {PROVIDERS.map((provider) => (
                <li
                  className={`byo-tile${provider.key === "more" ? " byo-more" : ""}`}
                  data-reveal=""
                  data-tile={provider.name}
                  key={`${provider.key}-${provider.name}`}
                >
                  <span>
                    <b>{provider.name}</b>
                    <small>{provider.how}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="byo-group">
            <h3>Your tools</h3>
            <p className="byo-sub">
              Connect about 1,000 apps, use built in web search, and add MCP servers and plugins.
              Here are some of the apps.
            </p>
            <ul className="byo-grid byo-tools" data-reveal-group="">
              {TOOLS.map((name) => (
                <li className="byo-tile" data-reveal="" key={name}>
                  <b>{name}</b>
                </li>
              ))}
            </ul>
            <ul className="byo-extras">
              {EXTRAS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <p className="byo-fine">
            Your plan or key is billed by its provider. Product names belong to their owners.
          </p>
        </div>
      </section>

      <section className="sec chn wea-sec" id="channels">
        <div className="wea-wrap">
          <div className="wea-center" data-reveal="">
            <h2>Message them anywhere</h2>
            <p className="wea-lead">
              Chat in the Wea app today. Slack, Teams, texting and more are on the way.
            </p>
          </div>
          <ul className="chn-grid" data-reveal-group="">
            {CHANNELS.map((channel) => (
              <li
                className={`chn-card ${channel.status === "live" ? "is-live" : "is-soon"}`}
                data-reveal=""
                data-channel={channel.key}
                key={channel.key}
              >
                <div className="chn-head">
                  <h3>{channel.name}</h3>
                  {channel.status === "live" ? (
                    <span className="chn-tag is-live">
                      <i />
                      Live
                    </span>
                  ) : (
                    <span className="chn-tag">Coming soon</span>
                  )}
                </div>
                <p>{channel.line}</p>
                <ChannelBody channel={channel} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
