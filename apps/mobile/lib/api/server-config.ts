/** Shared by connection settings and reporting before the full API module can load. */
export const API_BASE_STORAGE_KEY = "rakazo.api_base";
export const LOCAL_API = "http://127.0.0.1:3100";
/** The Wea server a release build opens to; Connection settings can still point it elsewhere. */
export const WEA_API = "https://wea.weassist.io";
const releaseBuild = typeof __DEV__ !== "undefined" && !__DEV__;
export const DEFAULT_API = process.env.EXPO_PUBLIC_API_URL ?? (releaseBuild ? WEA_API : LOCAL_API);
