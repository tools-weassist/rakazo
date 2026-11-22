import { Trans, useLingui } from "@lingui/react/macro";
import { ChatMarkdown } from "@rakazo/chat-ui/web";
import type {
  Bot,
  BotTemplateCategory,
  BotTemplateListing,
  ConnectionCatalogItem,
  Group,
  TeamTemplateListing,
} from "@rakazo/contracts";
import { BOT_TEMPLATE_CATEGORIES, isBotTemplateChanged } from "@rakazo/contracts";
import { botTemplateApps, formatCron } from "@rakazo/core";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  SectionHeading,
  Spinner,
} from "@rakazo/ui-web";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  BookOpenCheck,
  Bot as BotIcon,
  Brain,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  ChartLine,
  Check,
  ChevronDown,
  ChevronLeft,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FolderCheck,
  GitPullRequest,
  GraduationCap,
  HandCoins,
  Inbox,
  LayoutTemplate,
  ListChecks,
  Magnet,
  MailCheck,
  Megaphone,
  MoonStar,
  Newspaper,
  NotebookPen,
  Receipt,
  ReceiptText,
  Repeat2,
  Scale,
  ScrollText,
  SquareKanban,
  Sun,
  Telescope,
  Truck,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { useSave, useSpaceQueries } from "../../lib/query/query";
import { errorDetails } from "../../lib/query/user-error";
import { cronLabels } from "../../lib/routines/cron";
import { ErrorNotice } from "../ErrorNotice";
import { FilterChips } from "../filter-chips/filter-chips";
import { PluginLogo, ROW_HOVER } from "../integrations/plugin-marketplace";
import { useBotTemplateCategoryLabel, useBotTemplateCopy } from "./bot-template-copy";
import { useTeamTemplateCopy } from "./team-template-copy";

const ICONS: Record<string, LucideIcon> = {
  "ai-brain-keeper": Brain,
  "sop-builder": BookOpenCheck,
  "results-eod-report": ClipboardCheck,
  "va-client-finder": BriefcaseBusiness,
  "delegation-coach": ListChecks,
  "ai-upskill-coach": GraduationCap,
  "get-paid-back-office": Receipt,
  "scope-rate-guard": Scale,
  "inbox-admin-triage": MailCheck,
  "night-shift-handoff": MoonStar,
  "va-onboarding-kit": UserPlus,
  "receipt-categorizer": ReceiptText,
  "ar-follow-up": HandCoins,
  "month-end-close": CalendarCheck,
  "expense-report-prep": Wallet,
  "cash-flow-snapshot": ChartLine,
  "content-calendar-planner": CalendarDays,
  "social-post-repurposer": Repeat2,
  "newsletter-drafter": Newspaper,
  "lead-follow-up": Magnet,
  "campaign-recap": Megaphone,
  "sop-process-tracker": FolderCheck,
  "meeting-action-items": NotebookPen,
  "weekly-ops-report": ClipboardList,
  "vendor-tracker": Truck,
  "project-status-updates": SquareKanban,
  "morning-briefing": Sun,
  "inbox-triage": Inbox,
  "pr-reviewer": GitPullRequest,
  "topic-watch": Telescope,
};

function TemplateIcon({ id, large = false }: { id: string; large?: boolean }) {
  const Icon = ICONS[id] ?? LayoutTemplate;
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center border border-border/60 bg-muted text-foreground ${
        large ? "h-14 w-14 rounded-2xl" : "h-10 w-10 rounded-xl"
      }`}
    >
      <Icon size={large ? 24 : 18} />
    </span>
  );
}

function Sample({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background px-4 py-3 text-body">
      <ChatMarkdown>{text}</ChatMarkdown>
    </div>
  );
}

/** Ready-made bots. Creating one opens it; its routines stay paused until the user turns them on. */
/** The filter: All, one template category, or the ready-made teams. */
type Filter = BotTemplateCategory | "teams" | null;

export function BotTemplatesDialog({
  onClose,
  onOpenBot,
  onOpenGroup,
}: {
  onClose: () => void;
  onOpenBot: (bot: Bot) => void;
  /** Opens a team's group chat; without it the Teams filter is hidden. */
  onOpenGroup?: (group: Group) => void;
}) {
  const { t } = useLingui();
  const queries = useSpaceQueries();
  const copy = useBotTemplateCopy();
  const categoryLabel = useBotTemplateCategoryLabel();
  const cardId = useId();
  // Read afresh each time it opens: a template's bot may have been made or deleted since.
  const templates = useQuery({ ...queries.bots.templates.queryOptions(), staleTime: 0 });
  const teams = useQuery({
    ...queries.bots.teamTemplates.queryOptions(),
    staleTime: 0,
    enabled: Boolean(onOpenGroup),
  });
  const teamCopy = useTeamTemplateCopy();
  const [openId, setOpenId] = useState<string | null>(null);
  const [openTeamId, setOpenTeamId] = useState<string | null>(null);
  const [category, setCategory] = useState<Filter>(null);
  const open = templates.data?.find((template) => template.id === openId);
  const list = useRef<HTMLDivElement>(null);
  // Only categories with templates get a chip; a stale choice falls back to All.
  const categories = BOT_TEMPLATE_CATEGORIES.filter((name) =>
    templates.data?.some((template) => template.category === name),
  );
  const hasTeams = Boolean(onOpenGroup && teams.data?.length);
  const selected: Filter =
    category === "teams"
      ? hasTeams
        ? "teams"
        : null
      : category && categories.includes(category)
        ? category
        : null;
  const shown =
    selected === "teams"
      ? []
      : selected
        ? (templates.data ?? []).filter((template) => template.category === selected)
        : (templates.data ?? []);
  const chips: Filter[] = [null, ...(hasTeams ? (["teams"] as const) : []), ...categories];
  const showChips = Boolean(templates.data && !open && !openTeamId && chips.length >= 3);
  // A template's page starts at its top; going back returns to where the list was.
  const listScroll = useRef(0);
  useLayoutEffect(() => {
    if (list.current) list.current.scrollTop = openId || openTeamId ? 0 : listScroll.current;
  }, [openId, openTeamId]);
  const openTemplate = (id: string | null) => {
    if (id && list.current) listScroll.current = list.current.scrollTop;
    setOpenId(id);
  };
  const openTeamTemplate = (id: string | null) => {
    if (id && list.current) listScroll.current = list.current.scrollTop;
    setOpenTeamId(id);
  };
  const pick = (next: Filter) => {
    setCategory(next);
    // A shorter list starts at its top rather than wherever the longer one was scrolled to.
    listScroll.current = 0;
    if (list.current) list.current.scrollTop = 0;
  };
  const openTeam = teams.data?.find((team) => team.id === openTeamId);
  const memberName = (templateId: string, fallback: string) => {
    const template = templates.data?.find((item) => item.id === templateId);
    return template ? copy(template).name : fallback;
  };

  function content() {
    if (templates.error)
      return (
        <ErrorNotice error={errorDetails(templates.error, t`Could not load templates`)}>
          <Button variant="outline" size="sm" onClick={() => void templates.refetch()}>
            <Trans>Retry</Trans>
          </Button>
        </ErrorNotice>
      );
    if (!templates.data)
      return (
        <div className="grid place-items-center py-10">
          <Spinner className="size-5 text-muted-foreground" aria-label={t`Loading…`} />
        </div>
      );
    if (openTeam && onOpenGroup)
      return (
        <TeamDetail
          team={openTeam}
          memberName={memberName}
          onBack={() => openTeamTemplate(null)}
          onOpenGroup={onOpenGroup}
          onChanged={() => {
            void teams.refetch();
            void templates.refetch();
          }}
        />
      );
    if (open)
      return (
        <TemplateDetail
          template={open}
          onBack={() => openTemplate(null)}
          onOpenBot={onOpenBot}
          onChanged={() => void templates.refetch()}
        />
      );
    return (
      <div className="flex flex-col gap-4">
        {selected === "teams" ? (
          <div className="grid grid-cols-1 gap-3" data-testid="team-template-list">
            {teams.data?.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                copy={teamCopy(team)}
                memberName={memberName}
                onOpen={() => openTeamTemplate(team.id)}
              />
            ))}
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {shown.map((template, index) => {
            const { name, summary, sample } = copy(template);
            const titleId = `${cardId}-${index}-title`;
            const summaryId = `${cardId}-${index}-summary`;
            return (
              <button
                key={template.id}
                type="button"
                data-testid="bot-template-card"
                aria-labelledby={titleId}
                aria-describedby={summaryId}
                onClick={() => openTemplate(template.id)}
                className={`flex min-w-0 flex-col gap-3 rounded-2xl border border-border/70 p-4 text-start focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${ROW_HOVER}`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <TemplateIcon id={template.id} />
                  <span className="min-w-0 flex-1">
                    <span
                      id={titleId}
                      className="block truncate text-body-lg font-medium text-foreground"
                    >
                      {name}
                    </span>
                    <span
                      id={summaryId}
                      className="line-clamp-2 text-body-sm text-muted-foreground"
                    >
                      {summary}
                    </span>
                  </span>
                </span>
                {/* A glimpse of the example; the template's page shows all of it. */}
                <span className="block h-40 overflow-hidden rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-body-sm mask-b-from-60%">
                  <ChatMarkdown>{sample}</ChatMarkdown>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        data-testid="bot-templates-dialog"
        size="lg"
        className="bg-card"
      >
        <DialogHeader className="flex-row items-start justify-between px-8 pt-7">
          <DialogTitle className="text-heading2 text-foreground">
            <Trans>Bot templates</Trans>
          </DialogTitle>
          <DialogClose
            render={<Button variant="ghost" size="icon-sm" aria-label={t`Close bot templates`} />}
          >
            <X />
          </DialogClose>
        </DialogHeader>
        {/* The chips sit outside the scrolling list, so filtering never moves them. */}
        {showChips ? (
          <div className="px-8 pt-5">
            <FilterChips
              options={chips.map((name) => ({
                key: name,
                label:
                  name === "teams" ? (
                    <Trans>Teams</Trans>
                  ) : name ? (
                    categoryLabel(name)
                  ) : (
                    <Trans>All</Trans>
                  ),
              }))}
              value={selected}
              onChange={pick}
              label={t`Filter templates by category`}
              testId="bot-template-categories"
              className="-mx-8 px-8 sm:mx-0 sm:px-0"
            />
          </div>
        ) : null}
        <div
          ref={list}
          data-testid="bot-template-scroll"
          className={`min-h-0 flex-1 overflow-y-auto px-8 pb-8 ${showChips ? "pt-4" : "pt-5"}`}
        >
          {content()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplateDetail({
  template,
  onBack,
  onOpenBot,
  onChanged,
}: {
  template: BotTemplateListing;
  onBack: () => void;
  onOpenBot: (bot: Bot) => void;
  onChanged: () => void;
}) {
  const { t, i18n } = useLingui();
  const queries = useSpaceQueries();
  const { name, summary, sample } = useBotTemplateCopy()(template);
  const [expanded, setExpanded] = useState<string | null>(null);
  const open = useSave({
    save: async (input: { create: true } | { botId: string }, rpc) =>
      "botId" in input
        ? rpc.bots.get({ botId: input.botId })
        : (
            await rpc.bots.createFromTemplate({
              templateId: template.id,
              version: template.version,
              name,
            })
          ).bot,
    stale: (input) => ("botId" in input ? [] : [queries.bots.list.key()]),
    closesScreen: true,
    onSaved: (bot) => onOpenBot(bot),
    onFailed: (error, input) => {
      if (!("botId" in input) && isBotTemplateChanged(error)) onChanged();
    },
  });
  const pending = open.pending;
  const creating = !(open.input && "botId" in open.input);
  const error = open.error
    ? errorDetails(
        creating && isBotTemplateChanged(open.error)
          ? t`This template was just updated. Check it again.`
          : open.error,
        creating ? t`Could not create the bot` : t`Could not open the bot`,
      )
    : null;
  const catalog = useQuery({
    ...queries.connections.catalog.queryOptions({ input: {} }),
    enabled: template.apps.length > 0,
  });
  const apps = botTemplateApps(template, catalog.data ?? []);
  const schedule = (crons: string[]) =>
    crons.map((cron) => formatCron(cron, cronLabels(i18n.locale))).join(", ");

  const rows: { key: string; icon: LucideIcon; title: string; detail: string; body?: string }[] = [
    {
      key: "bot",
      icon: BotIcon,
      title: name,
      detail: t`Instructions`,
      body: template.instructions,
    },
    ...template.skills.map((skill) => ({
      key: `skill:${skill.name}`,
      icon: ScrollText,
      title: skill.name,
      detail: t`Skill`,
      body: skill.body,
    })),
    ...template.routines.map((routine, index) => ({
      key: `routine:${index}`,
      icon: Clock,
      title: routine.name,
      detail: t`${schedule(routine.crons)}, paused until you turn it on`,
      body: routine.prompt,
    })),
  ];

  return (
    <div data-testid="bot-template-detail" className="space-y-7">
      {/* On a phone the title and summary wrap, and the button moves to its own row. */}
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="mt-3.5 -ms-2 text-muted-foreground"
          aria-label={t`Back`}
          disabled={pending}
          onClick={onBack}
        >
          <ChevronLeft />
        </Button>
        <span className="hidden sm:contents">
          <TemplateIcon id={template.id} large />
        </span>
        <div className="min-w-0 flex-1 pt-1">
          <h2 className="text-heading2 font-semibold text-pretty break-words text-foreground">
            {name}
          </h2>
          <p className="text-body text-pretty break-words text-muted-foreground">{summary}</p>
        </div>
        <div className="shrink-0 pt-2 max-sm:w-full max-sm:pt-0 max-sm:ps-10 max-sm:[&>button]:w-full">
          {template.botId ? (
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => open.run({ botId: template.botId! })}
            >
              <Trans>Open</Trans>
            </Button>
          ) : (
            <Button
              size="lg"
              className="px-5"
              disabled={pending}
              onClick={() => open.run({ create: true })}
            >
              {pending ? <Trans>Creating…</Trans> : <Trans>Create bot</Trans>}
            </Button>
          )}
        </div>
      </div>

      {error ? <ErrorNotice error={error} /> : null}

      <Sample text={sample} />

      <section className="space-y-2">
        <SectionHeading className="px-1">
          <Trans>Adds</Trans>
        </SectionHeading>
        <ul className="divide-y divide-border/60 rounded-xl border border-border/70">
          {rows.map((row) => {
            const Icon = row.icon;
            const isOpen = expanded === row.key;
            return (
              <li key={row.key}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : row.key)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-start focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50"
                >
                  <Icon size={16} className="shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-lg font-medium break-words">{row.title}</span>
                    <span className="block text-body-sm break-words text-muted-foreground">
                      {row.detail}
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && row.body ? (
                  <div className="mx-4 mb-3 rounded-lg bg-background px-3.5 py-2.5 text-body-sm">
                    <ChatMarkdown>{row.body}</ChatMarkdown>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {apps.length ? (
        <AppsSection apps={apps} />
      ) : (
        <section className="space-y-2">
          <SectionHeading className="px-1">
            <Trans>Works with</Trans>
          </SectionHeading>
          <p className="rounded-xl border border-border/70 px-4 py-3 text-body-sm text-muted-foreground">
            <Trans>No apps to connect. It works in chat and can search the web.</Trans>
          </p>
        </section>
      )}
    </div>
  );
}

function AppsSection({ apps }: { apps: ConnectionCatalogItem[] }) {
  const { t } = useLingui();
  return (
    <section className="space-y-2">
      <SectionHeading className="px-1">
        <Trans>Works with</Trans>
      </SectionHeading>
      <ul className="divide-y divide-border/60 rounded-xl border border-border/70">
        {apps.map((app) => (
          <li key={app.slug} className="flex items-center gap-3 px-4 py-3">
            <PluginLogo name={app.name} logo={app.logo} />
            <span className="min-w-0 flex-1 truncate text-body-lg font-medium">{app.name}</span>
            {app.connected ? (
              <Check role="img" aria-label={t`Connected`} className="size-4 text-success" />
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function TeamCard({
  team,
  copy,
  memberName,
  onOpen,
}: {
  team: TeamTemplateListing;
  copy: ReturnType<ReturnType<typeof useTeamTemplateCopy>>;
  memberName: (templateId: string, fallback: string) => string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      data-testid="team-template-card"
      onClick={onOpen}
      className={`flex min-w-0 flex-col gap-3 rounded-2xl border border-border/70 p-4 text-start focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${ROW_HOVER}`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/60 bg-muted"
        >
          <Users size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-body-lg font-medium text-foreground">{copy.name}</span>
          <span className="block text-body-sm text-muted-foreground">{copy.summary}</span>
        </span>
      </span>
      <span className="flex flex-wrap gap-1.5">
        {team.members.map((member) => (
          <span key={member.templateId} className="rounded-lg bg-muted px-2 py-1 text-body-sm">
            {memberName(member.templateId, member.name)}
            {member.templateId === team.lead ? (
              <span className="text-muted-foreground">
                {" "}
                · <Trans>Lead</Trans>
              </span>
            ) : null}
          </span>
        ))}
      </span>
    </button>
  );
}

function TeamDetail({
  team,
  memberName,
  onBack,
  onOpenGroup,
  onChanged,
}: {
  team: TeamTemplateListing;
  memberName: (templateId: string, fallback: string) => string;
  onBack: () => void;
  onOpenGroup: (group: Group) => void;
  onChanged: () => void;
}) {
  const { t } = useLingui();
  const queries = useSpaceQueries();
  const copy = useTeamTemplateCopy()(team);
  // Always apply, even when there's a group: it repairs a missing member and refreshes the notes.
  const apply = useSave({
    save: async (input: { teamId: string; version: number }, rpc) =>
      rpc.bots.createTeamFromTemplate(input),
    stale: [
      queries.bots.list.key(),
      queries.bots.templates.key(),
      queries.bots.teamTemplates.key(),
    ],
    closesScreen: true,
    onSaved: (result) => onOpenGroup(result.group),
    onFailed: () => onChanged(),
  });
  return (
    <div data-testid="team-template-detail" className="space-y-6">
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="-ms-2"
          aria-label={t`Back`}
          disabled={apply.pending}
          onClick={onBack}
        >
          <ChevronLeft />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="text-heading2 font-semibold text-foreground">{copy.name}</h2>
          <p className="text-body text-muted-foreground">{copy.summary}</p>
        </div>
      </div>

      {apply.error ? (
        <ErrorNotice
          error={errorDetails(
            isBotTemplateChanged(apply.error)
              ? t`This template was just updated. Check it again.`
              : apply.error,
            t`Could not finish the team. Try again; the bots already made are kept.`,
          )}
        />
      ) : null}

      <Sample text={copy.sample} />

      <section className="space-y-2">
        <SectionHeading className="px-1">
          <Trans>Team members</Trans>
        </SectionHeading>
        <ul className="divide-y divide-border/60 rounded-xl border border-border/70">
          {team.members.map((member) => (
            <li key={member.templateId} className="flex items-start gap-3 px-4 py-3">
              <TemplateIcon id={member.templateId} />
              <div className="min-w-0 flex-1">
                <div className="text-body-lg font-medium">
                  {memberName(member.templateId, member.name)}
                  {member.templateId === team.lead ? (
                    <span className="text-body-sm text-muted-foreground">
                      {" "}
                      · <Trans>Lead</Trans>
                    </span>
                  ) : null}
                </div>
                <p className="text-body-sm text-muted-foreground">
                  {copy.roles[member.templateId] ?? member.role}
                </p>
                {member.botId ? (
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    <Trans>Your existing bot joins the team</Trans>
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-body-sm text-muted-foreground">
        <Trans>
          Creates the missing bots and a group chat. Bots you already made from these templates are
          reused, and each member gets a note naming the team. Routines stay paused. Nothing runs or
          is sent until you ask.
        </Trans>
      </p>
      <Button
        size="lg"
        disabled={apply.pending}
        onClick={() => apply.run({ teamId: team.id, version: team.version })}
      >
        {apply.pending ? (
          <Trans>Creating…</Trans>
        ) : team.groupId ? (
          <Trans>Open team</Trans>
        ) : (
          <Trans>Create team</Trans>
        )}
      </Button>
    </div>
  );
}
