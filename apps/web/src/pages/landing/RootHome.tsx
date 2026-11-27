import { Navigate } from "react-router-dom";
import { hasSignedInBefore } from "../../lib/auth/returning-user";
import { desktopBridge } from "../../lib/platform/desktop";
import { signedOutHomeDestination } from "./home-destination";
import { LandingPage } from "./LandingPage";

/** `/` for a resolved session: the app if signed in, else the public landing or native auth. */
export function RootHome({ user }: { user?: { id: string } }) {
  if (user) return <Navigate to="/app" replace />;
  const destination = signedOutHomeDestination({
    isNativeClient: Boolean(desktopBridge()),
    hasSignedInBefore: hasSignedInBefore(),
  });
  if (destination) return <Navigate to={destination} replace />;
  return <LandingPage />;
}
