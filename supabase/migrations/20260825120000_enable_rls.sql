-- Fix: "RLS Disabled in Public" (Supabase Security Advisor)
--
-- All application tables live in the `trophify` schema, which is exposed
-- to PostgREST. None of them had Row Level Security enabled, so anyone
-- holding the project's anon/authenticated key could read or write these
-- tables directly over the REST API, completely bypassing the Fastify
-- API's business rules (event phase gating, admin-token checks,
-- self-vote blocking, etc. — see apps/api/src/routes and
-- apps/api/src/lib/admin.ts).
--
-- The API only ever talks to Supabase with the service_role key
-- (apps/api/src/lib/supabase.ts), and service_role always bypasses RLS.
-- So enabling RLS here with no policies for anon/authenticated is a
-- pure lockdown: it closes the direct-access hole while leaving the
-- application's behavior completely unchanged.

alter table trophify.events enable row level security;
alter table trophify.participants enable row level security;
alter table trophify.categories enable row level security;
alter table trophify.votes enable row level security;
