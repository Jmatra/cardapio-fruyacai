import { Suspense } from "react";
import { MenuPage } from "@/components/features/cardapio/MenuPage";
import { CartDrawer } from "@/components/features/pedido/CartDrawer";

export default function CardapioPage() {
  return (
    <>
      <Suspense fallback={<MenuSkeleton />}>
        <MenuPage />
      </Suspense>
      <CartDrawer />
    </>
  );
}

function MenuSkeleton() {
  return (
    <div className="min-h-screen bg-surface pt-16 px-4">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-surface-card rounded-lg w-48 mb-6" />
        <div className="flex gap-3 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-24 bg-surface-card rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-surface-card rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
