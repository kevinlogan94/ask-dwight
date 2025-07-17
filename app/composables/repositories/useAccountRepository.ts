import type { Database, Tables, TablesInsert, TablesUpdate } from "~/models/supabase";

export function useAccountRepository() {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const accountsQuery = supabase.from("accounts");

  /**
   * Fetch all accounts for the current user.
   * @returns A promise that resolves to an array of accounts.
   */
  async function fetchAccounts(): Promise<Tables<"accounts">[]> {
    if (!user.value) {
      console.error("User must be logged in to fetch accounts.");
      return [];
    }
    try {
      const { data, error } = await accountsQuery.select("*").eq("user_id", user.value.id);

      if (error) {
        console.error("Error fetching accounts:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("An unexpected error occurred in fetchAccounts:", error);
      throw error;
    }
  }

  /**
   * Create a new account.
   * @param dto The data for creating the account.
   * @returns The created account data.
   */
  async function createAccount(dto: TablesInsert<"accounts">): Promise<Tables<"accounts"> | null> {
    try {
      const { data, error } = await accountsQuery.insert(dto).select().single();

      if (error) {
        console.error("Error creating account:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("An unexpected error occurred in createAccount:", error);
      throw error;
    }
  }

  /**
   * Update an existing account.
   * @param id The ID of the account to update.
   * @param dto The data to update.
   * @returns The updated account data.
   */
  async function updateAccount(id: string, dto: TablesUpdate<"accounts">): Promise<Tables<"accounts"> | null> {
    try {
      const { data, error } = await accountsQuery.update(dto).eq("id", id).select().single();

      if (error) {
        console.error(`Error updating account ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`An unexpected error occurred in updateAccount for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an account.
   * @param id The ID of the account to delete.
   */
  async function deleteAccount(id: string): Promise<void> {
    try {
      const { error } = await accountsQuery.delete().eq("id", id);

      if (error) {
        console.error(`Error deleting account ${id}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`An unexpected error occurred in deleteAccount for id ${id}:`, error);
      throw error;
    }
  }

  return {
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}
