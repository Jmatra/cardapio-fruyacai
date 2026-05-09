"use client";

import Image from "next/image";
import type { Product } from "@/types";
import { cn } from "@/lib/utils/cn";

interface ProductCardProps {
  product: Product;
  onAdd: () => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);

  return (
    <div className="group relative bg-surface-card border border-surface-border rounded-2xl overflow-hidden hover:border-brand-700 transition-all hover:shadow-glow-sm">
      {/* Imagem */}
      <div className="relative aspect-square bg-surface-subtle">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            🍇
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-white leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-white/40 text-xs line-clamp-2 mb-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-brand-300 font-bold text-sm">
            {formattedPrice}
          </span>
          <button
            onClick={onAdd}
            className="w-8 h-8 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center text-lg font-bold transition-colors active:scale-90"
            aria-label={`Adicionar ${product.name}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
