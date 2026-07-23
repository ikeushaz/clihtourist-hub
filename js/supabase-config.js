// ============================================================
// Fill these in with your own Supabase project's values.
// Dashboard → Project Settings → API
// The "anon public" key is SAFE to expose in frontend code —
// it can only do what your Row Level Security policies allow
// (see supabase-schema.sql: public read + public insert only).
// ============================================================
const SUPABASE_URL = "https://punyvchrlmeaehojruxf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bnl2Y2hybG1lYWVob2pydXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTk1MzAsImV4cCI6MjEwMDM3NTUzMH0.JXzo2dUT1wYe-ZOurUhL1jsd8eLidUG0kljECQfSl80";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
