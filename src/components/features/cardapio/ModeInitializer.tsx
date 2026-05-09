"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";

/**
 * Componente invisível que lê ?mesa=N ou ?balcao=1
 * e configura o modo do carrinho.
 */
export function ModeInitializer() {
  const searchParams = useSearchParams();
  const setMode = useCartStore((s) => s.setMode);

  useEffect(() => {
    const mesaParam = searchParams.get("mesa");
    const balcaoParam = searchParams.get("balcao");

    if (mesaParam) {
      const num = parseInt(mesaParam, 10);
      if (!isNaN(num) && num > 0) {
        setMode("mesa", num);
        return;
      }
    }

    if (balcaoParam !== null) {
      setMode("balcao");
    }
  }, [searchParams, setMode]);

  return null;
}
