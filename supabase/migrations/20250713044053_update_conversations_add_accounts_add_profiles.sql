create table "public"."accounts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "vector_store_id" text,
    "name" text not null,
    "user_id" uuid not null,
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."accounts" enable row level security;

create table "public"."profiles" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "vector_store_id" text,
    "user_id" uuid not null
);


alter table "public"."profiles" enable row level security;

alter table "public"."conversations" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."conversations" add column "vector_store_id" text;

CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."accounts" add constraint "accounts_pkey" PRIMARY KEY using index "accounts_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."accounts" add constraint "accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."accounts" validate constraint "accounts_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

grant delete on table "public"."accounts" to "anon";

grant insert on table "public"."accounts" to "anon";

grant references on table "public"."accounts" to "anon";

grant select on table "public"."accounts" to "anon";

grant trigger on table "public"."accounts" to "anon";

grant truncate on table "public"."accounts" to "anon";

grant update on table "public"."accounts" to "anon";

grant delete on table "public"."accounts" to "authenticated";

grant insert on table "public"."accounts" to "authenticated";

grant references on table "public"."accounts" to "authenticated";

grant select on table "public"."accounts" to "authenticated";

grant trigger on table "public"."accounts" to "authenticated";

grant truncate on table "public"."accounts" to "authenticated";

grant update on table "public"."accounts" to "authenticated";

grant delete on table "public"."accounts" to "service_role";

grant insert on table "public"."accounts" to "service_role";

grant references on table "public"."accounts" to "service_role";

grant select on table "public"."accounts" to "service_role";

grant trigger on table "public"."accounts" to "service_role";

grant truncate on table "public"."accounts" to "service_role";

grant update on table "public"."accounts" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

create policy "Allow Insert for User"
on "public"."accounts"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Enable Select for user"
on "public"."accounts"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Enable Update for User"
on "public"."accounts"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Enable Insert for User"
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Enable Select for User"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER on_accounts_updated BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER on_conversations_updated BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


