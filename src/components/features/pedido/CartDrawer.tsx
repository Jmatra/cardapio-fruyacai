"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { createOrder, calculateTotal } from "@/services/orderService";
import { cn } from "@/lib/utils/cn";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [clientNameInput, setClientNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const items = useCartStore((s) => s.items);
  const mode = useCartStore((s) => s.mode);
  const mesa = useCartStore((s) => s.mesa);
  const clientName = useCartStore((s) => s.clientName);
  const setClientName = useCartStore((s) => s.setClientName);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice);

  /* Ouve evento customizado do botão flutuante */
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-cart", handler);
    return () => window.removeEventListener("open-cart", handler);
  }, []);

  const formatted = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  /* ─── Finalizar pedido ─── */
  const handleFinalize = () => {
    if (items.length === 0) return;

    // Balcão: exige nome antes de finalizar
    if (mode === "balcao" && !clientName) {
      setNameModalOpen(true);
      return;
    }

    submitOrder();
  };

  const handleNameConfirm = () => {
    const name = clientNameInput.trim();
    if (!name) {
      toast.error("Por favor, informe o nome do cliente.");
      return;
    }
    setClientName(name);
    setNameModalOpen(false);
    submitOrder(name);
  };

  const submitOrder = async (nameOverride?: string) => {
    try {
      setSubmitting(true);
      const orderId = await createOrder({
        mode: mode!,
        mesa: mode === "mesa" ? mesa ?? undefined : undefined,
        clientName: mode === "balcao" ? (nameOverride ?? clientName ?? undefined) : undefined,
        items,
        total: calculateTotal(items),
        status: "novo",
      });

      clearCart();
      setOpen(false);
      setClientNameInput("");
      toast.success(`Pedido #${orderId.slice(-4).toUpperCase()} enviado! ✅`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-surface-subtle border-l border-surface-border shadow-2xl flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Carrinho</h2>
            {mode === "mesa" && (
              <p className="text-white/50 text-xs">Mesa {mesa}</p>
            )}
            {mode === "balcao" && (
              <p className="text-white/50 text-xs">Balcão</p>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-card text-white/60 hover:text-white flex items-center justify-center text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-white/30 py-12">
              <p className="text-4xl mb-2">🛒</p>
              <p>Carrinho vazio</p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-3 bg-surface-card rounded-xl p-3 border border-surface-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-white/40">
                    {formatted(product.price)} un.
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-7 h-7 rounded-full bg-surface-hover text-white flex items-center justify-center text-sm hover:bg-brand-700 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-7 h-7 rounded-full bg-surface-hover text-white flex items-center justify-center text-sm hover:bg-brand-700 transition-colors"
                  >
                    +
                  </button>
                </div>

                <p className="text-sm font-bold text-brand-300 w-16 text-right">
                  {formatted(product.price * quantity)}
                </p>

                <button
                  onClick={() => removeItem(product.id)}
                  className="text-white/30 hover:text-red-400 transition-colors text-sm"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-surface-border space-y-3">
            <div className="flex items-center justify-between text-lg font-bold">
              <span className="text-white/70">Total</span>
              <span className="text-white">{formatted(totalPrice())}</span>
            </div>
            <button
              onClick={handleFinalize}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              {submitting ? "Enviando..." : "Finalizar pedido"}
            </button>
          </div>
        )}
      </aside>

      {/* Modal nome — balcão */}
      {nameModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70">
          <div className="bg-surface-card border border-surface-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <h3 className="font-display text-xl font-bold text-white mb-1">
              Nome do cliente
            </h3>
            <p className="text-white/50 text-sm mb-4">
              Informe o nome para identificar o pedido no balcão.
            </p>
            <input
              type="text"
              value={clientNameInput}
              onChange={(e) => setClientNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameConfirm()}
              placeholder="Ex: João Silva"
              autoFocus
              className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setNameModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-surface-border text-white/60 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleNameConfirm}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
