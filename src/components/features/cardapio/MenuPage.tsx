"use client";

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import type { Product, ProductCategory } from "@/types";
import { ProductCard } from "./ProductCard";
import { useCartStore } from "@/stores/cartStore";

export function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const mode = useCartStore((s) => s.mode);
  const mesa = useCartStore((s) => s.mesa);
  const addItem = useCartStore((s) => s.addItem);
  const totalItems = useCartStore((s) => s.totalItems);

  /* ─── Carregar produtos ─── */
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("available", "==", true),
      orderBy("category"),
      orderBy("order")
    );

    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
      setLoading(false);
    });

    return unsub;
  }, []);

  /* ─── Carregar categorias ─── */
  useEffect(() => {
    const q = query(
      collection(db, "categories"),
      orderBy("order")
    );

    const unsub = onSnapshot(q, (snap) => {
      setCategories(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductCategory))
      );
    });

    return unsub;
  }, []);

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  const topPadding = mode ? "pt-20" : "pt-8";

  return (
    <div className={`min-h-screen bg-surface ${topPadding} pb-32`}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <header className="mb-6">
          <h1 className="font-display text-3xl font-bold text-white">
            {mode === "mesa" ? `Mesa ${mesa}` : mode === "balcao" ? "Balcão" : "Cardápio"}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Escolha seus itens e finalize o pedido
          </p>
        </header>

        {/* Filtro de categorias */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !activeCategory
                  ? "bg-brand-600 text-white"
                  : "bg-surface-card text-white/60 hover:text-white"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-brand-600 text-white"
                    : "bg-surface-card text-white/60 hover:text-white"
                }`}
              >
                {cat.emoji && <span className="mr-1">{cat.emoji}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Grid de produtos */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-surface-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-white/40 py-16">
            <p className="text-4xl mb-2">🍃</p>
            <p>Nenhum produto disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() => addItem(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Botão flutuante do carrinho */}
      {totalItems() > 0 && <CartButton count={totalItems()} />}
    </div>
  );
}

function CartButton({ count }: { count: number }) {
  const openCart = () => {
    window.dispatchEvent(new CustomEvent("open-cart"));
  };

  return (
    <button
      onClick={openCart}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-brand-600 hover:bg-brand-500 text-white px-5 py-3 rounded-full shadow-glow transition-all active:scale-95"
    >
      <span className="text-xl">🛒</span>
      <span className="font-semibold">Ver carrinho</span>
      <span className="bg-white text-brand-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
        {count}
      </span>
    </button>
  );
}
