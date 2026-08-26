-- Fix 403 permission denied for table users (code 42501) on existing deployment
-- Run this in Supabase Dashboard > SQL Editor if initial migration was already applied without GRANTs
grant usage on schema public to service_role, anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
