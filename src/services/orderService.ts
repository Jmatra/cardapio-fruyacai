/**
 * @module orderService
 * Camada de dados para pedidos no Firestore.
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import type { Order, OrderStatus, CartItem } from "@/types";

const ORDERS_COL = "orders";

/* ─── Helpers ─── */

function toOrder(id: string, data: DocumentData): Order {
  return {
    id,
    mode: data.mode,
    mesa: data.mesa ?? undefined,
    clientName: data.clientName ?? undefined,
    items: data.items ?? [],
    total: data.total ?? 0,
    status: data.status,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : data.createdAt ?? new Date(),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : data.updatedAt,
  };
}

/* ─── Criar pedido ─── */

export async function createOrder(
  payload: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, ORDERS_COL), {
    ...payload,
    status: "novo" as OrderStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/* ─── Atualizar status ─── */

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  await updateDoc(doc(db, ORDERS_COL, orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/* ─── Listener em tempo real — pedidos ativos (admin) ─── */

export function subscribeToActiveOrders(
  callback: (orders: Order[]) => void
): () => void {
  const q = query(
    collection(db, ORDERS_COL),
    where("status", "not-in", ["entregue"]),
    orderBy("status"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snap: QuerySnapshot) => {
    const orders = snap.docs.map((d) => toOrder(d.id, d.data()));
    callback(orders);
  });
}

/* ─── Listener de um pedido específico (cliente acompanhar) ─── */

export function subscribeToOrder(
  orderId: string,
  callback: (order: Order | null) => void
): () => void {
  return onSnapshot(doc(db, ORDERS_COL, orderId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback(toOrder(snap.id, snap.data()));
  });
}

/* ─── Formatação do total ─── */

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
}
