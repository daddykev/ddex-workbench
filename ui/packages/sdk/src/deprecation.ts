// packages/sdk/src/deprecation.ts

const warned = new Set<string>();

/** Log a deprecation warning once per process (or page load). */
export function warnDeprecated(name: string, message: string): void {
  if (warned.has(name)) return;
  warned.add(name);
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(`[@ddex-workbench/sdk] ${name} is deprecated: ${message}`);
  }
}

export const KEY_MANAGEMENT_DEPRECATION =
  "API key management requires a signed-in session and isn't supported from the SDK. " +
  "Manage keys at https://ddex-workbench.org/api-keys. These methods will be removed in 2.0.";
