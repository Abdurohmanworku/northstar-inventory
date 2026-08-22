// api/stock/index.js  →  GET /api/stock?itemId=A001
import { getSupabase, missingEnvResponse, handlePreflight } from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const supabase = getSupabase();
  if (!supabase) return missingEnvResponse(res);

  const itemId = String(req.query?.itemId ?? "").trim().toUpperCase();
  if (!itemId)
    return res
      .status(400)
      .json({ error: "Missing itemId", example: "/api/stock?itemId=A001" });

  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("item_id", itemId)
    .maybeSingle();

  if (error)
    return res.status(500).json({
      error: "Failed to fetch item",
      detail: error.message,
      code: error.code,
    });

  if (!data) return res.status(404).json({ error: `Item '${itemId}' not found` });

  return res.status(200).json({
    itemId: data.item_id,
    name: data.name,
    quantity: data.quantity,
    inStock: data.in_stock,
    checkedAt: new Date().toISOString(),
  });
}

