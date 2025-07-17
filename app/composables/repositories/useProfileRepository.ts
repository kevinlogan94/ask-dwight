import type { Database, Tables, TablesInsert } from "~/models/supabase";

export function useProfileRepository() {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const profilesQuery = supabase.from("profiles");

  /**
   * Get the current user's profile.
   * @returns The user's profile data.
   */
  async function getProfile(): Promise<Tables<"profiles"> | null> {
    if (!user.value) {
      console.error("User not logged in.");
      return null;
    }
    try {
      const { data, error } = await profilesQuery.select("*").eq("id", user.value.id).single();

      if (error) {
        // It's okay if a profile doesn't exist yet, so don't throw.
        console.warn("Could not fetch profile:", error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error("An unexpected error occurred in getProfile:", error);
      throw error;
    }
  }

  /**
   * Create a new profile.
   * @param dto The data for creating the profile.
   * @returns The created profile data.
   */
  async function createProfile(dto: TablesInsert<"profiles">): Promise<Tables<"profiles"> | null> {
    try {
      const { data, error } = await profilesQuery.insert(dto).select().single();

      if (error) {
        console.error("Error creating profile:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("An unexpected error occurred in createProfile:", error);
      throw error;
    }
  }

  return {
    getProfile,
    createProfile,
  };
}
