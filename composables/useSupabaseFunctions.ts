import { useSupabaseClient } from "#imports";

const SESSION_ID_KEY = "supabase_session_id";

export enum SupabaseFunctions {
  STORE_LOGS = "store-application-logs",
  HELLO_WORLD = "hello-world",
  // Add other function names here
}

export interface ApplicationLog {
  message: string;
  level: "info" | "warn" | "error";
}

export const useSupabaseFunctions = () => {
  const supabase = useSupabaseClient();
  const config = useRuntimeConfig();

  /**
   * Invoke a Supabase Edge Function
   */
  const invoke = async <T = any>(
    functionName: SupabaseFunctions,
    payload?: any,
    options: {
      headers?: Record<string, string>;
    } = {},
  ): Promise<T> => {
    const { data, error } = await supabase.functions.invoke<T>(functionName, {
      body: payload,
      headers: options.headers,
    });

    if (error) {
      console.error(`Error invoking ${functionName}:`, error);
      throw error;
    }

    return data;
  };

  /**
   * Get or create a session ID
   */
  const getOrCreateSessionId = (): string => {
    if (process.server) return ""; // Don't use localStorage on server

    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  };

  /**
   * Store application logs in Supabase
   */
  const storeLogs = async (log: ApplicationLog) => {
    const sessionId = getOrCreateSessionId();
    const user = useSupabaseUser();

    return invoke<{ success: boolean }>(SupabaseFunctions.STORE_LOGS, {
      ...log,
      session_id: sessionId,
      user_id: user.value?.id,
    });
  };

  return {
    invoke,
    storeLogs,
  };
};
