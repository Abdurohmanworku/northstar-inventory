// api/stock/update.js  →  POST /api/stock/update
import { getSupabaseWriter, missingEnvResponse, handlePreflight } from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const supabase = getSupabaseWriter();
  if (!supabase) return missingEnvResponse(res);

  // Vercel parses JSON bodies, but be defensive about string/empty bodies.
  let body = req.body ?? {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      return res.status(400).json({ error: "Body must be valid JSON" });
    }
  }

  const itemId = String(body.itemId ?? "").trim().toUpperCase();
  const { quantity } = body;

  if (!itemId || quantity === undefined)
    return res.status(400).json({ error: "Missing itemId or quantity" });

  if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity < 0)
    return res.status(400).json({ error: "quantity must be a non-negative number" });

  const { data, error } = await supabase
    .from("inventory")
    .update({
      quantity,
      in_stock: quantity > 0,
      updated_at: new Date().toISOString(),
    })
    .eq("item_id", itemId)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Supabase update error:", JSON.stringify(error));
    return res.status(500).json({
      error: "Failed to update stock",
      detail: error.message,
      code: error.code,
    });
  }

  if (!data) return res.status(404).json({ error: `Item '${itemId}' not found` });

  return res.status(200).json({
    message: "Stock updated successfully",
    itemId: data.item_id,
    updated: {
      name: data.name,
      quantity: data.quantity,
      inStock: data.in_stock,
    },
    updatedAt: data.updated_at,
  });
}

