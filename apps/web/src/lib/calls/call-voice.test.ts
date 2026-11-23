import { describe, expect, it } from "vitest";
import { callVoice } from "./call-voice";

describe("callVoice", () => {
  const both = { listen: true, speak: true };

  it("uses the connected provider when it is ready", () => {
    expect(callVoice(true, both)).toBe("provider");
    expect(callVoice(true, { listen: false, speak: false })).toBe("provider");
  });

  it("falls back to the browser's own voice without a provider", () => {
    expect(callVoice(false, both)).toBe("device");
    expect(callVoice(undefined, both)).toBe("device");
  });

  it("is unsupported when the browser cannot listen or speak", () => {
    expect(callVoice(false, { listen: false, speak: true })).toBe("unsupported");
    expect(callVoice(false, { listen: true, speak: false })).toBe("unsupported");
  });
});
