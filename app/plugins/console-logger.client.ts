// plugins/console-logger.client.ts
import { defineNuxtPlugin } from "#app";
import { getOrCreateSessionId } from "~/utils/helpers";
import { SupabaseFunctions } from "~/models/generic";

export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const isDev = process.env.NODE_ENV !== "production";

  /**
   * Store application logs in Supabase
   */
  const storeLogs = async (log: { message: string; level: "info" | "warn" | "error" }) => {
    // Only store logs in production
    if (isDev) return;

    const sessionId = getOrCreateSessionId();

    try {
      const { data, error } = await supabase.functions.invoke<{ success: boolean }>(SupabaseFunctions.STORE_LOGS, {
        body: {
          ...log,
          session_id: sessionId,
          user_id: user.value?.id,
        },
      });

      if (error) {
        originalError(`Error storing logs:`, error);
        return null;
      }

      return data;
    } catch (err) {
      originalError("Failed to log to Supabase:", err);
      return null;
    }
  };

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
    storeLogs({ level: "info", message: formatMessage(args) });
  };

  console.warn = (...args) => {
    if (isDev) {
      originalWarn(...args);
    }
    storeLogs({ level: "warn", message: formatMessage(args) });
  };

  console.error = (...args) => {
    if (isDev) {
      originalError(...args);
    }
    storeLogs({ level: "error", message: formatMessage(args) });
  };
});
