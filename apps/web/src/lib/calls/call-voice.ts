import { webSpeechAvailable } from "./dictation.js";
import { deviceSpeechAvailable } from "./tts.js";

/**
 * How a call talks: through the connected voice provider, or free with the browser's own
 * speech when none is ready. `unsupported`: no provider and the browser cannot listen or speak.
 */
export type CallVoice = "provider" | "device" | "unsupported";

export function callVoice(
  providerReady: boolean | undefined,
  browser = { listen: webSpeechAvailable(), speak: deviceSpeechAvailable() },
): CallVoice {
  if (providerReady) return "provider";
  return browser.listen && browser.speak ? "device" : "unsupported";
}
