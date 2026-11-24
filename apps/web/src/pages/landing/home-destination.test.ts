import { expect, it } from "vitest";
import { signedOutHomeDestination } from "./home-destination";

it("keeps signed-out browser visitors on the landing page", () => {
  expect(
    signedOutHomeDestination({ isNativeClient: false, hasSignedInBefore: false }),
  ).toBeNull();
  expect(
    signedOutHomeDestination({ isNativeClient: false, hasSignedInBefore: true }),
  ).toBeNull();
});

it("sends native clients to sign-in or sign-up, as `/` used to", () => {
  expect(
    signedOutHomeDestination({ isNativeClient: true, hasSignedInBefore: false }),
  ).toBe("/sign-up");
  expect(
    signedOutHomeDestination({ isNativeClient: true, hasSignedInBefore: true }),
  ).toBe("/sign-in");
});
