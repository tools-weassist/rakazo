#!/usr/bin/env bash
# Builds a release-signed Wea APK, or a Google Play app bundle (.aab), locally (no EAS).
# Generated android/ stays untracked.
#
# Needs JAVA_HOME (JDK 17), ANDROID_HOME (platform 37, build-tools 37, NDK 27.1) and:
#   WEA_KEYSTORE           path to the release keystore (.jks)
#   WEA_KEYSTORE_PASSWORD_FILE  file holding the store/key password
#   WEA_KEY_ALIAS          key alias (default: wea)
# Optional: WEA_ABIS (default arm64-v8a,armeabi-v7a for an APK, plus x86_64 for a bundle),
#   EXPO_PUBLIC_API_URL (default Wea server).
#   WEA_OUTPUT=apk (default) builds a sideload APK. WEA_OUTPUT=aab builds the Google Play bundle
#   (bundleRelease): it is bundled with EXPO_PUBLIC_WEA_STORE=play, which hides plans, prices and
#   checkout (Play's Payments policy), and is signed with the same key, used as the upload key.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${WEA_KEYSTORE:?set WEA_KEYSTORE}" "${WEA_KEYSTORE_PASSWORD_FILE:?set WEA_KEYSTORE_PASSWORD_FILE}"
export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-https://wea.weassist.io}"
export EXPO_NO_TELEMETRY=1 CI=1 NODE_ENV=production
OUTPUT="${WEA_OUTPUT:-apk}"
case "$OUTPUT" in
  apk)
    ABIS="${WEA_ABIS:-arm64-v8a,armeabi-v7a}"
    TASK=assembleRelease
    OUT_DIR=app/build/outputs/apk/release
    ;;
  aab)
    # Play serves each device only its own ABI, so the bundle can carry x86_64 for Chromebooks.
    ABIS="${WEA_ABIS:-arm64-v8a,armeabi-v7a,x86_64}"
    TASK=bundleRelease
    OUT_DIR=app/build/outputs/bundle/release
    export EXPO_PUBLIC_WEA_STORE="${EXPO_PUBLIC_WEA_STORE:-play}"
    ;;
  *)
    echo "WEA_OUTPUT must be apk or aab" >&2
    exit 64
    ;;
esac

npx expo prebuild --platform android --no-install --clean

# Sign release builds with the Wea keystore instead of the debug key.
node - "$WEA_KEYSTORE" "${WEA_KEY_ALIAS:-wea}" <<'JS'
const fs = require("fs");
const [store, alias] = process.argv.slice(2);
const file = "android/app/build.gradle";
let gradle = fs.readFileSync(file, "utf8");
const pw = 'new File(System.getenv("WEA_KEYSTORE_PASSWORD_FILE")).text.trim()';
gradle = gradle.replace(
  /signingConfigs \{/,
  `signingConfigs {\n        weaRelease {\n            storeFile file(${JSON.stringify(store)})\n            storePassword ${pw}\n            keyAlias ${JSON.stringify(alias)}\n            keyPassword ${pw}\n        }`,
);
gradle = gradle.replace(
  /(release \{[\s\S]*?)signingConfig signingConfigs\.debug/,
  "$1signingConfig signingConfigs.weaRelease",
);
if (!gradle.includes("signingConfigs.weaRelease")) throw new Error("could not wire release signing");
fs.writeFileSync(file, gradle);
JS

# Keep the build inside a small machine's memory.
{
  echo
  echo "org.gradle.jvmargs=-Xmx3072m -XX:MaxMetaspaceSize=768m -XX:+HeapDumpOnOutOfMemoryError"
  echo "org.gradle.workers.max=${WEA_GRADLE_WORKERS:-4}"
  echo "kotlin.daemon.jvmargs=-Xmx1536m"
} >> android/gradle.properties
sed -i "s/^reactNativeArchitectures=.*/reactNativeArchitectures=${ABIS}/" android/gradle.properties

cd android
./gradlew --no-daemon "$TASK" -PreactNativeArchitectures="${ABIS}"
ls -l "$OUT_DIR"/
