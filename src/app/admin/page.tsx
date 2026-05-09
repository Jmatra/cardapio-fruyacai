"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/types";
import { subscribeToActiveOrders, updateOrderStatus } from "@/services/orderService";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { cn } from "@/lib/utils/cn";

/* ─── Status config ─── */

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; next?: OrderStatus; nextLabel?: string }
> = {
  novo: {
    label: "Novo",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    next: "prep",
    nextLabel: "Iniciar preparo",
  },
  prep: {
    label: "Preparando",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    next: "pronto",
    nextLabel: "Marcar pronto",
  },
  pronto: {
    label: "Pronto",
    color: "bg-green-500/20 text-green-300 border-green-500/30",
    next: "entregue",
    nextLabel: "Marcar entregue",
  },
  entregue: {
    label: "Entregue",
    color: "bg-white/10 text-white/40 border-white/10",
  },
};

/* ─── Admin page ─── */

export default function AdminPage() {
  const { logout, user } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToActiveOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleAdvance = async (order: Order) => {
    const cfg = STATUS_CONFIG[order.status];
    if (!cfg.next || !order.id) return;

    try {
      await updateOrderStatus(order.id, cfg.next);
      toast.success(`Pedido atualizado: ${cfg.nextLabel}`);
    } catch {
      toast.error("Erro ao atualizar pedido.");
    }
  };

  const formatted = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  /* Agrupa pedidos por mesa/balcão */
  const grouped = orders.reduce<Record<string, Order[]>>((acc, order) => {
    const key =
      order.mode === "mesa"
        ? `Mesa ${order.mesa}`
        : `Balcão — ${order.clientName ?? "Sem nome"}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  const mesaKeys = Object.keys(grouped)
    .filter((k) => k.startsWith("Mesa"))
    .sort((a, b) => {
      const na = parseInt(a.replace("Mesa ", ""));
      const nb = parseInt(b.replace("Mesa ", ""));
      return na - nb;
    });

  const balcaoKeys = Object.keys(grouped).filter((k) => k.startsWith("Balcão"));

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-surface-subtle border-b border-surface-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍇</span>
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-none">
              FRUYAÇAÍ
            </h1>
            <p className="text-white/40 text-xs">Painel Admin</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/40 text-xs hidden sm:inline">
              {orders.length} pedido{orders.length !== 1 ? "s" : ""} ativo{orders.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-white/40 hover:text-white text-sm transition-colors"
          >
            Sair
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-white/30 py-24">
            <p className="text-5xl mb-3">✅</p>
            <p className="text-lg font-medium">Nenhum pedido ativo</p>
            <p className="text-sm mt-1">Os pedidos aparecem aqui em tempo real</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mesas */}
            {mesaKeys.length > 0 && (
              <section>
                <h2 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
                  🍽️ Mesas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mesaKeys.map((key) => (
                    <OrderGroup
                      key={key}
                      title={key}
                      orders={grouped[key]}
                      onAdvance={handleAdvance}
                      formatted={formatted}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Balcão */}
            {balcaoKeys.length > 0 && (
              <section>
                <h2 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
                  🏪 Balcão
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {balcaoKeys.map((key) => (
                    <OrderGroup
                      key={key}
                      title={key}
                      orders={grouped[key]}
                      onAdvance={handleAdvance}
                      formatted={formatted}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── OrderGroup ─── */

interface OrderGroupProps {
  title: string;
  orders: Order[];
  onAdvance: (order: Order) => void;
  formatted: (v: number) => string;
}

function OrderGroup({ title, orders, onAdvance, formatted }: OrderGroupProps) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
      {/* Header do grupo */}
      <div className="px-4 py-3 border-b border-surface-border bg-surface-subtle/50">
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>

      {/* Pedidos */}
      <div className="divide-y divide-surface-border/50">
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status];

          return (
            <div key={order.id} className="p-4 space-y-3">
              {/* Status badge */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full border",
                    cfg.color
                  )}
                >
                  {cfg.label}
                </span>
                <span className="text-white/30 text-xs">
                  #{order.id?.slice(-4).toUpperCase()}
                </span>
              </div>

              {/* Itens */}
              <ul className="space-y-1">
                {order.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-white/80">
                      <span className="text-white/40 mr-1">{item.quantity}×</span>
                      {item.product.name}
                    </span>
                    <span className="text-white/40 text-xs">
                      {formatted(item.product.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Total */}
              <div className="flex items-center justify-between pt-1 border-t border-surface-border/50">
                <span className="text-white/40 text-xs">Total</span>
                <span className="text-white font-semibold text-sm">
                  {formatted(order.total)}
                </span>
              </div>

              {/* Avançar status */}
              {cfg.next && (
                <button
                  onClick={() => onAdvance(order)}
                  className="w-full py-2 rounded-lg bg-brand-700/50 hover:bg-brand-600 text-white text-sm font-medium transition-colors border border-brand-700/50"
                >
                  {cfg.nextLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
