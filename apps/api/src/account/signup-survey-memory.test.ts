import { describe, expect, it } from "vitest";
import { ABOUT_ME_HEADING, aboutMeLines, withAboutMe } from "./signup-survey-memory.js";

describe("about me memory", () => {
  it("writes the role, brain and first needs", () => {
    expect(
      aboutMeLines({
        role: "va",
        roleDetail: "one_client",
        brain: "drive",
        needs: ["eod", "handoffs"],
      }),
    ).toEqual([
      "- Role: Virtual assistant (VA), works for one client.",
      "- AI brain (their knowledge base): in Google Drive. Organize what is there; don't start over.",
      "- Wants help first with: client reports (EOD); handoffs across time zones.",
    ]);
    expect(aboutMeLines({ source: "a friend" })).toEqual([]);
  });

  it("appends the section once and replaces it on a new answer", () => {
    const first = withAboutMe("# Memory\n\n- Likes short replies\n", ["- Role: Just exploring."]);
    expect(first).toBe(
      `# Memory\n\n- Likes short replies\n\n${ABOUT_ME_HEADING}\n\n- Role: Just exploring.\n`,
    );
    const again = withAboutMe(`${first}\n## Later notes\n\n- kept\n`, ["- Role: Business owner."]);
    expect(again).toBe(
      `# Memory\n\n- Likes short replies\n\n## Later notes\n\n- kept\n\n${ABOUT_ME_HEADING}\n\n- Role: Business owner.\n`,
    );
    expect(withAboutMe(first, [])).toBe("# Memory\n\n- Likes short replies\n");
  });
});
