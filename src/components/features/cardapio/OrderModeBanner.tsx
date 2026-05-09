"use client";

import { useCartStore } from "@/stores/cartStore";

export function OrderModeBanner() {
  const mode = useCartStore((s) => s.mode);
  const mesa = useCartStore((s) => s.mesa);

  if (!mode) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-semibold tracking-wide ${
        mode === "mesa"
          ? "bg-brand-700 text-white"
          : "bg-tropical-teal/20 text-teal-300 border-b border-teal-500/30"
      }`}
    >
      {mode === "mesa" ? (
        <span>🍽️ Mesa {mesa}</span>
      ) : (
        <span>🏪 Balcão</span>
      )}
    </div>
  );
}
