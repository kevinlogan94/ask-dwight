import { getOrCreateSessionId } from "~/utils/helpers";

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

  /**
   * Invoke a Supabase Edge Function
   */
  const invoke = async <T = any>(
    functionName: SupabaseFunctions,
    payload?: any,
    options: {
      headers?: Record<string, string>;
    } = {},
  ): Promise<T | null> => {
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
   * Store application logs in Supabase
   */
  const storeLogs = async (log: ApplicationLog) => {
    const sessionId = getOrCreateSessionId();
    const user = useSupabaseUser();

    // Only store logs in production
    if (process.env.NODE_ENV !== "production") return;

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
