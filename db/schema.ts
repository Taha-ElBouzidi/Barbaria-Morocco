import {
  pgTable,
  pgEnum,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const localeEnum = pgEnum("locale_enum", ["en", "fr"]);

export const productStatusEnum = pgEnum("product_status_enum", [
  "draft",
  "published",
]);

export const journalStatusEnum = pgEnum("journal_status_enum", [
  "draft",
  "published",
]);

export const facetTypeEnum = pgEnum("facet_type_enum", [
  "ingredient",
  "use",
  "format",
  "packaging",
  "certification",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status_enum", [
  "new",
  "contacted",
  "quoted",
  "won",
  "lost",
]);

export const adminRoleEnum = pgEnum("admin_role_enum", [
  "admin",
  "sales",
  "concierge",
  "readonly",
]);

export const auditEntityTypeEnum = pgEnum("audit_entity_type_enum", [
  "product",
  "journal_card",
  "atelier",
  "ritual",
  "ritual_subcategory",
  "facet",
  "inquiry",
]);

export const auditActionEnum = pgEnum("audit_action_enum", [
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "status_change",
]);

// ---------------------------------------------------------------------------
// 4.1  rituals
// ---------------------------------------------------------------------------

export const rituals = pgTable("rituals", {
  id: text("id").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  heroImagePath: text("hero_image_path"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 4.2  ritual_translations
// ---------------------------------------------------------------------------

export const ritualTranslations = pgTable(
  "ritual_translations",
  {
    ritualId: text("ritual_id")
      .references(() => rituals.id, { onDelete: "cascade" })
      .notNull(),
    locale: localeEnum("locale").notNull(),
    eyebrow: text("eyebrow").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull(),
    lede: text("lede").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.ritualId, table.locale] }),
  })
);

// ---------------------------------------------------------------------------
// 4.3  ritual_subcategories
// ---------------------------------------------------------------------------

export const ritualSubcategories = pgTable(
  "ritual_subcategories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ritualId: text("ritual_id")
      .references(() => rituals.id, { onDelete: "cascade" })
      .notNull(),
    slug: text("slug").notNull(),
    sortOrder: integer("sort_order").default(0),
  },
  (table) => ({
    ritualSlugUnique: uniqueIndex("ritual_subcategories_ritual_id_slug_idx").on(
      table.ritualId,
      table.slug
    ),
  })
);

// ---------------------------------------------------------------------------
// 4.4  ritual_subcategory_translations
// ---------------------------------------------------------------------------

export const ritualSubcategoryTranslations = pgTable(
  "ritual_subcategory_translations",
  {
    subcategoryId: uuid("subcategory_id")
      .references(() => ritualSubcategories.id, { onDelete: "cascade" })
      .notNull(),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.subcategoryId, table.locale] }),
  })
);

// ---------------------------------------------------------------------------
// 4.5  products
// ---------------------------------------------------------------------------

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    ritualId: text("ritual_id").references(() => rituals.id),
    subcategoryId: uuid("subcategory_id").references(
      () => ritualSubcategories.id
    ),
    moq: integer("moq").notNull(),
    formats: text("formats")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    lead: text("lead").notNull(),
    origin: text("origin"),
    ritualLabel: text("ritual_label"),
    hero: boolean("hero").default(false),
    status: productStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // FK to auth.users(id); enforced in migration SQL
    createdBy: uuid("created_by"),
    // FK to auth.users(id); enforced in migration SQL
    updatedBy: uuid("updated_by"),
  },
  (table) => ({
    slugUnique: uniqueIndex("products_slug_idx").on(table.slug),
    statusRitualHeroIdx: index("products_status_ritual_hero_idx").on(
      table.status,
      table.ritualId,
      table.hero
    ),
  })
);

// ---------------------------------------------------------------------------
// 4.6  product_translations
// ---------------------------------------------------------------------------

export const productTranslations = pgTable(
  "product_translations",
  {
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
    short: text("short").notNull(),
    lede: text("lede"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.locale] }),
  })
);

// ---------------------------------------------------------------------------
// 4.7  product_images
// ---------------------------------------------------------------------------

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    path: text("path").notNull(),
    altText: text("alt_text"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    productSortIdx: index("product_images_product_id_sort_order_idx").on(
      table.productId,
      table.sortOrder
    ),
  })
);

// ---------------------------------------------------------------------------
// 4.8  product_application_steps
// ---------------------------------------------------------------------------

export const productApplicationSteps = pgTable(
  "product_application_steps",
  {
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    stepNumber: integer("step_number").notNull(),
    locale: localeEnum("locale").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.productId, table.stepNumber, table.locale],
    }),
  })
);

// ---------------------------------------------------------------------------
// 4.9  facets
// ---------------------------------------------------------------------------

export const facets = pgTable(
  "facets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: facetTypeEnum("type").notNull(),
    valueEn: text("value_en").notNull(),
    valueFr: text("value_fr").notNull(),
    sortOrder: integer("sort_order").default(0),
  },
  (table) => ({
    typeValueEnUnique: uniqueIndex("facets_type_value_en_idx").on(
      table.type,
      table.valueEn
    ),
  })
);

// ---------------------------------------------------------------------------
// 4.10  product_facets  (join table)
// ---------------------------------------------------------------------------

export const productFacets = pgTable(
  "product_facets",
  {
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    facetId: uuid("facet_id")
      .references(() => facets.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.facetId] }),
  })
);

// ---------------------------------------------------------------------------
// 4.11  ateliers
// ---------------------------------------------------------------------------

export const ateliers = pgTable("ateliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  sinceYear: integer("since_year").notNull(),
  imagePath: text("image_path"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 4.12  atelier_translations
// ---------------------------------------------------------------------------

export const atelierTranslations = pgTable(
  "atelier_translations",
  {
    atelierId: uuid("atelier_id")
      .references(() => ateliers.id, { onDelete: "cascade" })
      .notNull(),
    locale: localeEnum("locale").notNull(),
    description: text("description").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.atelierId, table.locale] }),
  })
);

// ---------------------------------------------------------------------------
// 4.13  journal_cards
// ---------------------------------------------------------------------------

export const journalCards = pgTable(
  "journal_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").unique().notNull(),
    date: date("date").notNull(),
    imagePath: text("image_path"),
    feature: boolean("feature").default(false),
    status: journalStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // FK to auth.users(id); enforced in migration SQL
    createdBy: uuid("created_by"),
    // FK to auth.users(id); enforced in migration SQL
    updatedBy: uuid("updated_by"),
  },
  (table) => ({
    statusDateIdx: index("journal_cards_status_date_idx").on(
      table.status,
      table.date
    ),
  })
);

// ---------------------------------------------------------------------------
// 4.14  journal_card_translations
// ---------------------------------------------------------------------------

export const journalCardTranslations = pgTable(
  "journal_card_translations",
  {
    cardId: uuid("card_id")
      .references(() => journalCards.id, { onDelete: "cascade" })
      .notNull(),
    locale: localeEnum("locale").notNull(),
    kicker: text("kicker").notNull(),
    headline: text("headline").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.cardId, table.locale] }),
  })
);

// ---------------------------------------------------------------------------
// 4.15  inquiries
// ---------------------------------------------------------------------------

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company: text("company").notNull(),
    contactName: text("contact_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    quantity: text("quantity"),
    eventDate: date("event_date"),
    occasion: text("occasion"),
    message: text("message"),
    locale: localeEnum("locale"),
    status: inquiryStatusEnum("status").notNull().default("new"),
    sourceUrl: text("source_url"),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // FK to auth.users(id); enforced in migration SQL
    assignedTo: uuid("assigned_to"),
    notes: text("notes"),
  },
  (table) => ({
    statusCreatedAtIdx: index("inquiries_status_created_at_idx").on(
      table.status,
      table.createdAt
    ),
    emailIdx: index("inquiries_email_idx").on(table.email),
  })
);

// ---------------------------------------------------------------------------
// 4.16  inquiry_items
// ---------------------------------------------------------------------------

export const inquiryItems = pgTable(
  "inquiry_items",
  {
    inquiryId: uuid("inquiry_id")
      .references(() => inquiries.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "restrict" })
      .notNull(),
    qty: integer("qty").notNull().default(1),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.inquiryId, table.productId] }),
  })
);

// ---------------------------------------------------------------------------
// 4.17  admin_users
// ---------------------------------------------------------------------------

export const adminUsers = pgTable("admin_users", {
  // FK to auth.users(id) ON DELETE CASCADE; enforced in migration SQL
  id: uuid("id").primaryKey(),
  email: text("email").unique().notNull(),
  role: adminRoleEnum("role").notNull().default("admin"),
  displayName: text("display_name"),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 4.18  audit_log
// ---------------------------------------------------------------------------

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // FK to auth.users(id) ON DELETE SET NULL; enforced in migration SQL
    actorId: uuid("actor_id"),
    entityType: auditEntityTypeEnum("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: auditActionEnum("action").notNull(),
    beforeState: jsonb("before_state"),
    afterState: jsonb("after_state"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    entityTypeIdCreatedAtIdx: index(
      "audit_log_entity_type_entity_id_created_at_idx"
    ).on(table.entityType, table.entityId, table.createdAt),
    actorCreatedAtIdx: index("audit_log_actor_id_created_at_idx").on(
      table.actorId,
      table.createdAt
    ),
  })
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const ritualsRelations = relations(rituals, ({ many }) => ({
  translations: many(ritualTranslations),
  subcategories: many(ritualSubcategories),
  products: many(products),
}));

export const ritualTranslationsRelations = relations(
  ritualTranslations,
  ({ one }) => ({
    ritual: one(rituals, {
      fields: [ritualTranslations.ritualId],
      references: [rituals.id],
    }),
  })
);

export const ritualSubcategoriesRelations = relations(
  ritualSubcategories,
  ({ one, many }) => ({
    ritual: one(rituals, {
      fields: [ritualSubcategories.ritualId],
      references: [rituals.id],
    }),
    translations: many(ritualSubcategoryTranslations),
    products: many(products),
  })
);

export const ritualSubcategoryTranslationsRelations = relations(
  ritualSubcategoryTranslations,
  ({ one }) => ({
    subcategory: one(ritualSubcategories, {
      fields: [ritualSubcategoryTranslations.subcategoryId],
      references: [ritualSubcategories.id],
    }),
  })
);

export const productsRelations = relations(products, ({ one, many }) => ({
  translations: many(productTranslations),
  images: many(productImages),
  applicationSteps: many(productApplicationSteps),
  facets: many(productFacets),
  inquiryItems: many(inquiryItems),
  ritual: one(rituals, {
    fields: [products.ritualId],
    references: [rituals.id],
  }),
  subcategory: one(ritualSubcategories, {
    fields: [products.subcategoryId],
    references: [ritualSubcategories.id],
  }),
}));

export const productTranslationsRelations = relations(
  productTranslations,
  ({ one }) => ({
    product: one(products, {
      fields: [productTranslations.productId],
      references: [products.id],
    }),
  })
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productApplicationStepsRelations = relations(
  productApplicationSteps,
  ({ one }) => ({
    product: one(products, {
      fields: [productApplicationSteps.productId],
      references: [products.id],
    }),
  })
);

export const facetsRelations = relations(facets, ({ many }) => ({
  products: many(productFacets),
}));

export const productFacetsRelations = relations(productFacets, ({ one }) => ({
  product: one(products, {
    fields: [productFacets.productId],
    references: [products.id],
  }),
  facet: one(facets, {
    fields: [productFacets.facetId],
    references: [facets.id],
  }),
}));

export const ateliersRelations = relations(ateliers, ({ many }) => ({
  translations: many(atelierTranslations),
}));

export const atelierTranslationsRelations = relations(
  atelierTranslations,
  ({ one }) => ({
    atelier: one(ateliers, {
      fields: [atelierTranslations.atelierId],
      references: [ateliers.id],
    }),
  })
);

export const journalCardsRelations = relations(journalCards, ({ many }) => ({
  translations: many(journalCardTranslations),
}));

export const journalCardTranslationsRelations = relations(
  journalCardTranslations,
  ({ one }) => ({
    card: one(journalCards, {
      fields: [journalCardTranslations.cardId],
      references: [journalCards.id],
    }),
  })
);

export const inquiriesRelations = relations(inquiries, ({ many }) => ({
  items: many(inquiryItems),
}));

export const inquiryItemsRelations = relations(inquiryItems, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [inquiryItems.inquiryId],
    references: [inquiries.id],
  }),
  product: one(products, {
    fields: [inquiryItems.productId],
    references: [products.id],
  }),
}));
