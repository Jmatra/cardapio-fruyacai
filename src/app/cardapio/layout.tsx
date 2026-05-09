import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderModeBanner } from "@/components/features/cardapio/OrderModeBanner";
import { ModeInitializer } from "@/components/features/cardapio/ModeInitializer";

export const metadata: Metadata = {
  title: "Cardápio",
};

export default function CardapioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Inicializa o modo (mesa/balcão) a partir dos search params */}
      <Suspense>
        <ModeInitializer />
      </Suspense>

      {/* Banner fixo no topo mostrando o modo atual */}
      <Suspense>
        <OrderModeBanner />
      </Suspense>

      {children}
    </>
  );
}
