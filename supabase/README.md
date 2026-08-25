# Supabase migrations

This project has no other database-as-code — the schema itself (tables,
constraints, the `trophify` schema) is managed by hand in the Supabase
dashboard. This folder only holds follow-up migrations like security
fixes that need to be tracked and applied deliberately.

## Applying a migration

Run the SQL in `migrations/` against the project's database, either via:

- the Supabase CLI: `supabase db push` (requires `supabase link` first), or
- the Supabase Studio SQL editor, pasting the file's contents.

## `20260825120000_enable_rls.sql`

Enables Row Level Security on every table in the `trophify` schema
(`events`, `participants`, `categories`, `votes`). Fixes the Supabase
Security Advisor's "RLS Disabled in Public" finding.

No policies are added. The Fastify API (`apps/api`) only ever connects
with the `service_role` key, which bypasses RLS — so the app's behavior
is unaffected. What changes is that the `anon`/`authenticated` roles can
no longer read or write these tables directly over the PostgREST API;
all access has to go through the API's own authorization logic.
