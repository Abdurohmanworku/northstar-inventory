// api/stock.js  →  GET /api/stock?itemId=A001
import supabase from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const { itemId } = req.query;
  if (!itemId)
    return res.status(400).json({ error: "Missing itemId", example: "/api/stock?itemId=A001" });

  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("item_id", itemId)
    .single();

  if (error || !data)
    return res.status(404).json({ error: `Item '${itemId}' not found` });

  return res.status(200).json({
    itemId:    data.item_id,
    name:      data.name,
    quantity:  data.quantity,
    inStock:   data.in_stock,
    checkedAt: new Date().toISOString(),
  });
}
