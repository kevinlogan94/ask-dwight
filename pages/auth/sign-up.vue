<template>
    <div class="flex flex-col items-center justify-center gap-4 p-4 min-h-screen">
      <UPageCard class="w-full max-w-md">
        <UAuthForm
          :schema="schema"
          title="Sign up"
          description="Sign up to get started"
          icon="i-heroicons-user-plus"
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
      name: "first_name",
      type: "text" as const,
      label: "First Name",
      placeholder: "Enter your first name",
      required: true,
    },
    {
      name: "last_name",
      type: "text" as const,
      label: "Last Name",
      placeholder: "Enter your last name",
      required: true,
    },
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
      required: true,
    },
    {
      name: "confirm_password",
      label: "Confirm Password",
      type: "password" as const,
      placeholder: "Confirm your password",
      required: true,
    }
  ];
  
  const schema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Must be at least 8 characters"),
    confirm_password: z.string().min(8, "Must be at least 8 characters"),
  }).refine(
    (data) => data.password === data.confirm_password,
    {
      message: "Passwords must match",
      path: ["confirm_password"],
    }
  );
  
  type Schema = z.output<typeof schema>;
  
  function onSubmit(payload: FormSubmitEvent<Schema>) {
    console.log("Submitted", payload);
  }
  
  useHead({
    title: "Sign Up",
    meta: [
      { name: 'description', content: 'Sign up to get started' }
    ]
  });
  </script>
  