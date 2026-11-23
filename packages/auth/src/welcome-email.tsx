/** @jsxRuntime automatic */
import type { TransactionalEmail } from "@rakazo/adapter-kit";
import { Link, Text } from "react-email";
import { emailText, greeting, linkStyle, message, withNodes } from "./email.js";

const WEA_WEB_URL = "https://wea.weassist.io";
const HELP_EMAIL = "tools@weassist.io";

const stepStyle = { margin: "20px 0 4px" };

export function welcomeEmail(
  user: { email: string; name: string },
  unsubscribeUrl: string,
  locale = "en",
): Promise<TransactionalEmail> {
  const say = emailText(locale);
  return message(
    user.email,
    locale,
    say("Welcome to Wea"),
    <>
      <Text>{greeting(say, user.name)}</Text>
      <Text>{say("Welcome to Wea. Here's how to get started:")}</Text>
      <Text style={stepStyle}>
        <strong>1. {say("Open Wea")}</strong>
      </Text>
      <Text style={{ marginTop: 0 }}>
        {withNodes(
          say(
            "Sign in at {web} from any browser. Your first bot is waiting there to help you set up.",
          ),
          {
            web: (
              <Link href={WEA_WEB_URL} style={linkStyle}>
                wea.weassist.io
              </Link>
            ),
          },
        )}
      </Text>
      <Text style={stepStyle}>
        <strong>2. {say("Android app")}</strong>
      </Text>
      <Text style={{ marginTop: 0 }}>
        {say(
          "The Wea app for Android is coming to Google Play soon. Until then, Wea works in your phone's browser too.",
        )}
      </Text>
      <Text style={{ marginTop: "28px" }}>
        {withNodes(say("Questions? Reply to this email or write to {email}."), {
          email: (
            <Link href={`mailto:${HELP_EMAIL}`} style={linkStyle}>
              {HELP_EMAIL}
            </Link>
          ),
        })}
      </Text>
      <Text>{say("The Wea team")}</Text>
    </>,
    unsubscribeUrl,
    { src: "https://wea.weassist.io/apple-touch-icon.png", alt: "Wea" },
  );
}
