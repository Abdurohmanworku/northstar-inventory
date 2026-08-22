// api/stock/update.js  →  POST /api/stock/update
import supabase from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { itemId, quantity } = req.body ?? {};

  if (!itemId || quantity === undefined)
    return res.status(400).json({ error: "Missing itemId or quantity" });

  if (typeof quantity !== "number" || quantity < 0)
    return res.status(400).json({ error: "quantity must be a non-negative number" });

  const { data, error } = await supabase
    .from("inventory")
    .update({
      quantity,
      in_stock:   quantity > 0,
      updated_at: new Date().toISOString(),
    })
    .eq("item_id", itemId)
    .select()
    .single();

  if (error || !data)
    return res.status(404).json({ error: `Item '${itemId}' not found` });

  return res.status(200).json({
    message:   "Stock updated successfully",
    itemId:    data.item_id,
    updated: {
      name:     data.name,
      quantity: data.quantity,
      inStock:  data.in_stock,
    },
    updatedAt: data.updated_at,
  });
}if (error || !data)
  return res.status(404).json({ error: `Item '${itemId}' not found` });// api/stock/update.js  →  POST /api/stock/update
import supabase from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { itemId, quantity } = req.body ?? {};

  if (!itemId || quantity === undefined)
    return res.status(400).json({ error: "Missing itemId or quantity" });

  if (typeof quantity !== "number" || quantity < 0)
    return res.status(400).json({ error: "quantity must be a non-negative number" });

  const { data, error } = await supabase
    .from("inventory")
    .update({
      quantity,
      in_stock:   quantity > 0,
      updated_at: new Date().toISOString(),
    })
    .eq("item_id", itemId)
    .select()
    .single();

  if (error || !data)
    return res.status(404).json({ error: `Item '${itemId}' not found` });

  return res.status(200).json({
    message:   "Stock updated successfully",
    itemId:    data.item_id,
    updated: {
      name:     data.name,
      quantity: data.quantity,
      inStock:  data.in_stock,
    },
    updatedAt: data.updated_at,
  });
}
