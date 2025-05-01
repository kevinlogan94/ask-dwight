<template>
    <div class="flex flex-col items-center justify-center gap-4 p-4 min-h-screen">
      <UPageCard class="w-full max-w-md">
        <UAuthForm
          :schema="schema"
          title="Password Reset"
          description="Enter your email to reset your password"
          icon="i-heroicons-lock-closed"
          :fields="fields"
          @submit="onSubmit"
        />
      </UPageCard>
    </div>
  </template>
  
  <script setup lang="ts">
  import * as z from "zod";
  import type { FormSubmitEvent } from "@nuxt/ui-pro";
  
  const toast = useToast();
  
  const fields = [
    {
      name: "email",
      type: "text" as const,
      label: "Email",
      placeholder: "Enter your email",
      required: true,
    }
  ];
  
  const schema = z.object({
    email: z.string().email("Invalid email"),
  });
  
  type Schema = z.output<typeof schema>;
  
  function onSubmit(payload: FormSubmitEvent<Schema>) {
    console.log("Submitted", payload);
  }
  
  useHead({
    title: "Password Reset",
    meta: [
      { name: 'description', content: 'Reset your password' }
    ]
  });
  </script>
  