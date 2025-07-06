import { defineStore } from "pinia";
import type { Tables } from "~/models/supabase";
import type { File } from "~/models/generic";
import { useAccountRepository } from "~/composables/repositories/useAccountRepository";
import { useVectorStoreService } from "~/composables/services/useVectorStoreService";
type Account = Tables<"accounts">;

export const useAccountStore = defineStore("account", () => {
  const user = useSupabaseUser();

  // State
  const accounts = ref<Account[]>([]);
  const selectedAccountId = ref<string | null>(null);
  const accountFiles = ref<File[]>([]);

  // Getters
  const selectedAccount = computed(() => {
    return accounts.value.find((a) => a.id === selectedAccountId.value) || null;
  });

  // Dependencies
  const { fetchAccounts: fetchRepoAccounts, createAccount: createRepoAccount } = useAccountRepository();
  const { createNewStore, fetchFiles } = useVectorStoreService();

  // Actions
  async function fetchAccounts() {
    try {
      accounts.value = await fetchRepoAccounts();
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  }

  async function selectAccount(accountId: string | null) {
    selectedAccountId.value = accountId;
    if (!accountId) {
      accountFiles.value = [];
      return;
    }

    const account = accounts.value.find((a) => a.id === accountId);
    if (account && account.vector_store_id) {
      try {
        accountFiles.value = await fetchFiles(account.vector_store_id);
      } catch (error) {
        console.error(`Error fetching files for account ${accountId}:`, error);
        accountFiles.value = [];
      }
    } else {
      accountFiles.value = [];
    }
  }

  async function createAccount(name: string) {
    if (!user.value) {
      console.error("User must be logged in to create an account.");
      return;
    }
    try {
      const newStoreId = await createNewStore(`Account: ${name}`);
      if (!newStoreId) {
        throw new Error("Failed to create a new vector store for the account.");
      }

      await createRepoAccount({
        name,
        user_id: user.value.id,
        vector_store_id: newStoreId,
      });

      await fetchAccounts(); // Refresh the list
    } catch (error) {
      console.error("Error creating account:", error);
    }
  }

  // Load initial data
  onMounted(fetchAccounts);

  return {
    // State
    accounts,
    selectedAccountId,
    accountFiles,

    // Getters
    selectedAccount,

    // Actions
    fetchAccounts,
    selectAccount,
    createAccount,
  };
});
