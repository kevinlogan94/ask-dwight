import type { Database, TablesInsert } from "~/models/supabase";

export function useProfileRepository() {
  const supabase = useSupabaseClient<Database>();
  const profilesQuery = supabase.from("profiles");

  /**
   * Create a new profile.
   * @param dto The data for creating the profile.
   * @returns The created profile data.
   */
  async function createProfile(dto: TablesInsert<"profiles">) {
    try {
      const { data, error } = await profilesQuery
        .insert(dto)
        .select()
        .single();

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
    createProfile,
  };
}
