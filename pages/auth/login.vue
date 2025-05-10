<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 min-h-screen">
    <UPageCard class="w-full max-w-md">
      <UAuthForm title="Login" description="Login to your account" icon="i-heroicons-user" :providers="providers" />
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();

const providers = [
  {
    label: "Continue with Google",
    icon: "i-simple-icons-google",
    onClick: () => {
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
