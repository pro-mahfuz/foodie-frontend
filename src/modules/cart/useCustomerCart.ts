import { useCallback, useEffect, useRef, useState } from "react";
import { cartService } from "./service";
import type { CartView } from "./types";
import type { Order } from "../order";

export function useCustomerCart(customerId?: number) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const generation = useRef(0);
  const run = useCallback(async (operation: "load" | "add" | "clear" | "checkout", dishId?: number) => {
    if (!customerId || lock.current) return false;
    lock.current = true; setBusy(true); setError("");
    const version = generation.current;
    try {
      if (operation === "checkout") {
        const result = await cartService.checkout(customerId);
        if (version !== generation.current) return false;
        setOrder(result); setCart({ customerId, items: [], total: 0 });
      } else if (operation === "clear") {
        await cartService.clear(customerId);
        if (version !== generation.current) return false;
        setCart({ customerId, items: [], total: 0 }); setOrder(null);
      } else {
        const result = operation === "add" ? await cartService.addItem(customerId, dishId!) : await cartService.get(customerId);
        if (version !== generation.current) return false;
        setCart(result); if (operation === "add") setOrder(null);
      }
      return true;
    } catch (e) {
      if (version === generation.current) setError(e instanceof Error ? e.message : "Unable to update your cart. Please try again.");
      return false;
    } finally { if (version === generation.current) { lock.current = false; setBusy(false); } }
  }, [customerId]);
  useEffect(() => {
    generation.current++; lock.current = false; setCart(null); setOrder(null); setError(""); setBusy(false);
    if (customerId) void run("load");
    return () => { generation.current++; };
  }, [customerId, run]);
  return { cart, order, error, busy, run };
}
