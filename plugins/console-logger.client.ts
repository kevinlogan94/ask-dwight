// plugins/console-logger.client.ts
import { defineNuxtPlugin } from "#app";
import { useSupabaseFunctions } from "~/composables/useSupabaseFunctions";

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.server) return;

  const { storeLogs } = useSupabaseFunctions();
  const isDev = process.env.NODE_ENV === "development";

  // Store original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  // Helper to format log messages
  const formatMessage = (args: any[]) =>
    args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ");

  // Override console methods
  console.log = (...args) => {
    if (isDev) {
      originalLog(...args);
    }
    storeLogs({ level: "info", message: formatMessage(args) }).catch((err) =>
      originalError("Failed to log to Supabase:", err),
    );
  };

  console.warn = (...args) => {
    if (isDev) {
      originalWarn(...args);
    }
    storeLogs({ level: "warn", message: formatMessage(args) }).catch((err) =>
      originalError("Failed to log to Supabase:", err),
    );
  };

  console.error = (...args) => {
    if (isDev) {
      originalError(...args);
    }
    storeLogs({ level: "error", message: formatMessage(args) }).catch((err) =>
      originalError("Failed to log to Supabase:", err),
    );
  };
});
