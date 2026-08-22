// api/stock/all.js  →  GET /api/stock/all
import { getSupabase, missingEnvResponse, handlePreflight } from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const supabase = getSupabase();
  if (!supabase) return missingEnvResponse(res);

  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .order("item_id");

  if (error) {
    console.error("Supabase error:", JSON.stringify(error));
    return res.status(500).json({
      error: "Failed to fetch inventory",
      detail: error.message,
      code: error.code,
    });
  }

  const items = (data ?? []).map((row) => ({
    itemId: row.item_id,
    name: row.name,
    quantity: row.quantity,
    inStock: row.in_stock,
  }));

  return res.status(200).json({
    items,
    totalItems: items.length,
    inStockCount: items.filter((i) => i.inStock).length,
    outOfStock: items.filter((i) => !i.inStock).length,
    retrievedAt: new Date().toISOString(),
  });
}

