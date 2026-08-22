// lib/supabase.js
// Lazily builds a Supabase client so a missing env var produces a readable
// 500 from the API route instead of crashing the function at import time.

import { createClient } from "@supabase/supabase-js";

let readClient;
let writeClient;

function build(key) {
  const url = process.env.SUPABASE_URL;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Anon-key client, used for reads. */
export function getSupabase() {
  if (!readClient) readClient = build(process.env.SUPABASE_ANON_KEY);
  return readClient;
}

/** Service-role client when configured, otherwise falls back to the anon key. */
export function getSupabaseWriter() {
  if (!writeClient) {
    writeClient =
      build(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
      build(process.env.SUPABASE_ANON_KEY);
  }
  return writeClient;
}

/** Shared 500 body when environment variables are not set on the host. */
export function missingEnvResponse(res) {
  return res.status(500).json({
    error: "Server is not configured",
    detail:
      "Set SUPABASE_URL and SUPABASE_ANON_KEY (and optionally SUPABASE_SERVICE_ROLE_KEY) in your Vercel project environment variables, then redeploy.",
  });
}

/** Answers CORS preflight requests. Returns true when the request is handled. */
export function handlePreflight(req, res) {
  if (req.method !== "OPTIONS") return false;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.status(204).end();
  return true;
}

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
