"use client";

/**
 * @hook useOrderMode
 * Lê os parâmetros de URL (?mesa=1 ou ?balcao=1) e configura o modo do pedido.
 * Deve ser chamado uma vez no layout do cardápio.
 */

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import type { OrderMode } from "@/types";

export function useOrderMode() {
  const searchParams = useSearchParams();
  const { mode, mesa, setMode } = useCartStore();

  useEffect(() => {
    const mesaParam = searchParams.get("mesa");
    const balcaoParam = searchParams.get("balcao");

    if (mesaParam) {
      const mesaNum = parseInt(mesaParam, 10);
      if (!isNaN(mesaNum) && mesaNum > 0) {
        setMode("mesa", mesaNum);
        return;
      }
    }

    if (balcaoParam === "1" || balcaoParam === "true" || balcaoParam !== null) {
      setMode("balcao");
      return;
    }

    // Se não há parâmetro na URL mas já tinha modo salvo, mantém
  }, [searchParams, setMode]);

  return { mode, mesa };
}
