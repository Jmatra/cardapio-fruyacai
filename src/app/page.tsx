import { redirect } from "next/navigation";

/**
 * Página raiz — redireciona direto para o cardápio.
 * Não há login para o cliente nesta versão de loja física.
 *
 * Exemplos de URLs:
 *   /cardapio?mesa=1    → modo mesa, mesa 1
 *   /cardapio?mesa=3    → modo mesa, mesa 3
 *   /cardapio?balcao=1  → modo balcão (pede nome antes de finalizar)
 *   /cardapio           → modo indefinido (útil para testes)
 */
export default function RootPage() {
  redirect("/cardapio");
}
