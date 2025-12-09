import { db } from "@/database/db";
import { orders, orderItems } from "@/database/schema";
import { eq, and, desc, gte, lte, like, or, sql } from "drizzle-orm";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface OrderWithItems {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string;
  shippingZip: string;
  shippingCity: string;
  shippingCountry: string;
  paymentMethod: "emoney" | "cash";
  emoneyNumber: string | null;
  emoneyPin: string | null;
  subtotal: string;
  shipping: string;
  vat: string;
  grandTotal: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId: string;
    productSlug: string;
    productName: string;
    quantity: number;
    unitPrice: string;
    total: string;
    createdAt: Date;
  }>;
}

export class AdminOrderService {
  /**
   * List orders with filtering and pagination
   */
  static async list(filters: OrderFilters = {}) {
    const {
      status,
      dateFrom,
      dateTo,
      search,
      limit = 50,
      offset = 0,
    } = filters;

    // Build where conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(orders.status, status));
    }

    if (dateFrom) {
      conditions.push(gte(orders.createdAt, new Date(dateFrom)));
    }

    if (dateTo) {
      conditions.push(lte(orders.createdAt, new Date(dateTo)));
    }

    if (search) {
      conditions.push(
        or(
          like(orders.orderNumber, `%${search}%`),
          like(orders.customerName, `%${search}%`),
          like(orders.customerEmail, `%${search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get orders with total count
    const [orderList, totalResult] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count || 0);

    // For list view, we don't need to load all items (can be fetched on demand)
    // But we'll return orders with empty items array for consistency
    return {
      orders: orderList.map((order) => ({
        ...order,
        items: [],
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Get order by ID with items
   */
  static async getById(orderId: string): Promise<OrderWithItems | null> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return null;
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .orderBy(orderItems.createdAt);

    return {
      ...order,
      items: items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: item.unitPrice.toString(),
        total: item.total.toString(),
      })),
      subtotal: order.subtotal.toString(),
      shipping: order.shipping.toString(),
      vat: order.vat.toString(),
      grandTotal: order.grandTotal.toString(),
    };
  }

  /**
   * Update order status
   */
  static async updateStatus(
    orderId: string,
    newStatus: OrderStatus
  ): Promise<OrderWithItems | null> {
    // Validate status
    const validStatuses: OrderStatus[] = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    // Update order
    const [updated] = await db
      .update(orders)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updated) {
      return null;
    }

    // Return updated order with items
    return this.getById(orderId);
  }
}
