// lib/supabase.js
// Supabase client — imported by all API routes

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY — check your .env file"
  );
}

const supabase = createClient(url, key);

export default supabase;
