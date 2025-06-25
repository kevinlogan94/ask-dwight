

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."feedback_reaction_type" AS ENUM (
    'thumbs_up',
    'thumbs_down'
);


ALTER TYPE "public"."feedback_reaction_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_response_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "copied" boolean DEFAULT false NOT NULL,
    "dwight_response_id" "uuid" NOT NULL,
    "reaction" "public"."feedback_reaction_type"
);


ALTER TABLE "public"."ai_response_feedback" OWNER TO "postgres";


COMMENT ON TABLE "public"."ai_response_feedback" IS 'Feedback on the ai response';



CREATE TABLE IF NOT EXISTS "public"."application_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "message" "text" NOT NULL,
    "user_id" "uuid",
    "session_id" "uuid"
);


ALTER TABLE "public"."application_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."application_logs" IS 'The logs that are generated via the Nuxt Vue app at ask-dwight.com';



CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "session_id" "uuid" NOT NULL,
    "title" "text"
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


COMMENT ON TABLE "public"."conversations" IS 'Stores the base conversation data between Dwight and the user.';



CREATE TABLE IF NOT EXISTS "public"."dwight_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "prompt_id" "uuid" NOT NULL,
    "message" "text" NOT NULL
);


ALTER TABLE "public"."dwight_responses" OWNER TO "postgres";


COMMENT ON TABLE "public"."dwight_responses" IS 'Stores each AI-generated reply from Dwight';



CREATE TABLE IF NOT EXISTS "public"."user_prompt_suggestions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "suggestion_text" "text" NOT NULL,
    "dwight_response_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_prompt_suggestions" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_prompt_suggestions" IS 'Suggestions provided to a user to use for their next prompt';



CREATE TABLE IF NOT EXISTS "public"."user_prompts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "message" "text" NOT NULL,
    "category" "text",
    "time_saved" smallint,
    "conversation_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_prompts" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_prompts" IS 'Stores every message a user submits to Dwight, along with metadata';



ALTER TABLE ONLY "public"."ai_response_feedback"
    ADD CONSTRAINT "ai_response_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."application_logs"
    ADD CONSTRAINT "application_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dwight_responses"
    ADD CONSTRAINT "dwight_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_prompt_suggestions"
    ADD CONSTRAINT "user_prompt_suggestions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_prompts"
    ADD CONSTRAINT "user_prompts_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "on_ai_response_feedback_updated" BEFORE UPDATE ON "public"."ai_response_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."ai_response_feedback"
    ADD CONSTRAINT "ai_response_feedback_dwight_response_id_fkey" FOREIGN KEY ("dwight_response_id") REFERENCES "public"."dwight_responses"("id");



ALTER TABLE ONLY "public"."application_logs"
    ADD CONSTRAINT "application_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."dwight_responses"
    ADD CONSTRAINT "dwight_responses_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id");



ALTER TABLE ONLY "public"."dwight_responses"
    ADD CONSTRAINT "dwight_responses_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "public"."user_prompts"("id");



ALTER TABLE ONLY "public"."user_prompt_suggestions"
    ADD CONSTRAINT "user_prompt_suggestions_dwight_response_id_fkey" FOREIGN KEY ("dwight_response_id") REFERENCES "public"."dwight_responses"("id");



ALTER TABLE ONLY "public"."user_prompts"
    ADD CONSTRAINT "user_prompts_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id");



CREATE POLICY "Enable Insert for Anyone" ON "public"."ai_response_feedback" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable Insert for Anyone" ON "public"."dwight_responses" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable Select for User or Session" ON "public"."ai_response_feedback" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."dwight_responses" "dr"
     JOIN "public"."conversations" "c" ON (("dr"."conversation_id" = "c"."id")))
  WHERE (("dr"."id" = "ai_response_feedback"."dwight_response_id") AND (("auth"."uid"() = "c"."user_id") OR (((("current_setting"('request.headers'::"text", true))::"json" ->> 'supabase-session-id'::"text") = ("c"."session_id")::"text") AND ("c"."user_id" IS NULL)))))));



CREATE POLICY "Enable Update for User or Session " ON "public"."ai_response_feedback" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."conversations" "conv"
     JOIN "public"."dwight_responses" "dre" ON (("conv"."id" = "dre"."conversation_id")))
  WHERE (("dre"."id" = "ai_response_feedback"."dwight_response_id") AND (("auth"."uid"() = "conv"."user_id") OR (((("current_setting"('request.headers'::"text", true))::"json" ->> 'supabase-session-id'::"text") = ("conv"."session_id")::"text") AND ("conv"."user_id" IS NULL)))))));



CREATE POLICY "Enable insert for anyone" ON "public"."conversations" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for anyone" ON "public"."user_prompts" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable inserts for anyone" ON "public"."user_prompt_suggestions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable select by conversation owner/session" ON "public"."dwight_responses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "dwight_responses"."conversation_id") AND (("auth"."uid"() = "conversations"."user_id") OR (((("current_setting"('request.headers'::"text", true))::"json" ->> 'supabase-session-id'::"text") = ("conversations"."session_id")::"text") AND ("conversations"."user_id" IS NULL)))))));



CREATE POLICY "Enable select by conversation owner/session" ON "public"."user_prompt_suggestions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."dwight_responses" "dr"
     JOIN "public"."conversations" "c" ON (("dr"."conversation_id" = "c"."id")))
  WHERE (("dr"."id" = "user_prompt_suggestions"."dwight_response_id") AND (("auth"."uid"() = "c"."user_id") OR (((("current_setting"('request.headers'::"text", true))::"json" ->> 'supabase-session-id'::"text") = ("c"."session_id")::"text") AND ("c"."user_id" IS NULL)))))));



CREATE POLICY "Enable select by conversation owner/session" ON "public"."user_prompts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE ((("conversations"."id" = "user_prompts"."conversation_id") AND ("auth"."uid"() = "conversations"."user_id")) OR (((("current_setting"('request.headers'::"text", true))::"json" ->> 'supabase-session-id'::"text") = ("conversations"."session_id")::"text") AND ("conversations"."user_id" IS NULL))))));



CREATE POLICY "Enable select for user or session" ON "public"."conversations" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (((("current_setting"('request.headers'::"text", true))::"json" ->> 'supabase-session-id'::"text") = ("session_id")::"text") AND ("user_id" IS NULL))));



CREATE POLICY "Enable update for session/user" ON "public"."conversations" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR (((("current_setting"('request.headers'::"text", true))::"json" ->> 'supabase-session-id'::"text") = ("session_id")::"text") AND ("user_id" IS NULL))));



ALTER TABLE "public"."ai_response_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."application_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deny_all" ON "public"."application_logs" AS RESTRICTIVE USING (false);



ALTER TABLE "public"."dwight_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_prompt_suggestions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_prompts" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."ai_response_feedback" TO "anon";
GRANT ALL ON TABLE "public"."ai_response_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_response_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."application_logs" TO "anon";
GRANT ALL ON TABLE "public"."application_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."application_logs" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."dwight_responses" TO "anon";
GRANT ALL ON TABLE "public"."dwight_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."dwight_responses" TO "service_role";



GRANT ALL ON TABLE "public"."user_prompt_suggestions" TO "anon";
GRANT ALL ON TABLE "public"."user_prompt_suggestions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_prompt_suggestions" TO "service_role";



GRANT ALL ON TABLE "public"."user_prompts" TO "anon";
GRANT ALL ON TABLE "public"."user_prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."user_prompts" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
