import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  stage: text("stage").notNull(),
  priceCents: integer("price_cents").notNull(),
  unit: text("unit").notNull(),
  perUnit: text("per_unit").notNull(),
  badge: text("badge"),
  details: text("details").notNull().default(""),
  isHire: integer("is_hire", { mode: "boolean" }).notNull().default(false),
  imageKey: text("image_key"),
  stock: integer("stock"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default("pending"),
  customerEmail: text("customer_email"),
  customerId: integer("customer_id").references(() => customers.id),
  totalCents: integer("total_cents").notNull().default(0),
  postcode: text("postcode"),
  deliverySlot: text("delivery_slot"),
  deliveryMethod: text("delivery_method"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
  mode: text("mode").notNull().default("once"),
});

export const returnRequests = sqliteTable("return_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  orderItemId: integer("order_item_id").references(() => orderItems.id),
  reason: text("reason").notNull(),
  resolution: text("resolution").notNull().default("refund"),
  status: text("status").notNull().default("requested"),
  customerEmail: text("customer_email").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const feedbackIdeas = sqliteTable("feedback_ideas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  details: text("details").notNull().default(""),
  votes: integer("votes").notNull().default(0),
  submitterEmail: text("submitter_email"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const forumThreads = sqliteTable("forum_threads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  authorName: text("author_name").notNull(),
  replyCount: integer("reply_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const forumReplies = sqliteTable("forum_replies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  threadId: integer("thread_id")
    .notNull()
    .references(() => forumThreads.id),
  body: text("body").notNull(),
  authorName: text("author_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customerSessions = sqliteTable("customer_sessions", {
  id: text("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customerFavourites = sqliteTable("customer_favourites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// One saved basket per customer; overwritten wholesale on every autosave
// rather than tracked as individual line rows, since it's just a resume
// point, not an audit trail.
export const customerBaskets = sqliteTable("customer_baskets", {
  customerId: integer("customer_id")
    .primaryKey()
    .references(() => customers.id),
  linesJson: text("lines_json").notNull().default("[]"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
