<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 min-h-screen">
    <UPageCard class="w-full max-w-md">
      <UAuthForm title="Login" description="Login to your account" icon="i-lucide-user" :providers="providers">
        <template #footer>
          By signing in, you agree to our
          <ULink to="https://ask-dwight.com/terms" target="_blank" class="text-primary font-medium"
            >Terms of Service</ULink
          >
          and
          <ULink to="https://ask-dwight.com/privacy" target="_blank" class="text-primary font-medium"
            >Privacy Policy</ULink
          >.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ showSidebar: false });

const supabase = useSupabaseClient();

const providers = [
  {
    label: "Continue with Google",
    icon: "i-simple-icons-google",
    onClick: () => {
      useTrackEvent("login_page_submit", {
        event_category: "conversion",
        event_label: "authentication",
        non_interaction: true,
      });

      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
    },
  },
];

useHead({
  title: "Login",
  meta: [{ name: "description", content: "Login to your account" }],
});
</script>
