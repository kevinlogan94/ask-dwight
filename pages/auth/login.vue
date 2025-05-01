<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 min-h-screen">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Login"
        icon="i-heroicons-user"
        :providers="providers"
        :fields="fields"
        @submit="onSubmit"
      >
        <template #description>
          Don't have an account? <ULink to="/auth/sign-up" class="text-primary font-medium">Sign up</ULink>.
        </template>
        <template #password-hint>
          <ULink to="/auth/password-reset" class="text-primary font-medium" tabindex="-1">Forgot password?</ULink>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui-pro";

const supabase = useSupabaseClient();
const baseUrl = useRuntimeConfig().public.baseUrl;

const fields = [
  {
    name: "email",
    type: "text" as const,
    label: "Email",
    placeholder: "Enter your email",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password" as const,
    placeholder: "Enter your password",
  },
  {
    name: "remember",
    label: "Remember me",
    type: "checkbox" as const,
  },
];

const providers = [{
  label: 'Continue with Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/confirm`,
      },
    });
  }
}]

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log("Submitted", payload);
}

useHead({
  title: "Login",
  meta: [
    { name: 'description', content: 'Login to your account' }
  ]
});
</script>
