CREATE TYPE "public"."admin_role_enum" AS ENUM('admin', 'sales', 'concierge', 'readonly');--> statement-breakpoint
CREATE TYPE "public"."audit_action_enum" AS ENUM('create', 'update', 'delete', 'publish', 'unpublish', 'status_change');--> statement-breakpoint
CREATE TYPE "public"."audit_entity_type_enum" AS ENUM('product', 'journal_card', 'atelier', 'ritual', 'ritual_subcategory', 'facet', 'inquiry');--> statement-breakpoint
CREATE TYPE "public"."facet_type_enum" AS ENUM('ingredient', 'use', 'format', 'packaging', 'certification');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status_enum" AS ENUM('new', 'contacted', 'quoted', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."journal_status_enum" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."locale_enum" AS ENUM('en', 'fr');--> statement-breakpoint
CREATE TYPE "public"."product_status_enum" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" "admin_role_enum" DEFAULT 'admin' NOT NULL,
	"display_name" text,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "atelier_translations" (
	"atelier_id" uuid NOT NULL,
	"locale" "locale_enum" NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "atelier_translations_atelier_id_locale_pk" PRIMARY KEY("atelier_id","locale")
);
--> statement-breakpoint
CREATE TABLE "ateliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"region" text NOT NULL,
	"since_year" integer NOT NULL,
	"image_path" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ateliers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"entity_type" "audit_entity_type_enum" NOT NULL,
	"entity_id" text NOT NULL,
	"action" "audit_action_enum" NOT NULL,
	"before_state" jsonb,
	"after_state" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "facet_type_enum" NOT NULL,
	"value_en" text NOT NULL,
	"value_fr" text NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"quantity" text,
	"event_date" date,
	"occasion" text,
	"message" text,
	"locale" "locale_enum",
	"status" "inquiry_status_enum" DEFAULT 'new' NOT NULL,
	"source_url" text,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_to" uuid,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "inquiry_items" (
	"inquiry_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "inquiry_items_inquiry_id_product_id_pk" PRIMARY KEY("inquiry_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "journal_card_translations" (
	"card_id" uuid NOT NULL,
	"locale" "locale_enum" NOT NULL,
	"kicker" text NOT NULL,
	"headline" text NOT NULL,
	CONSTRAINT "journal_card_translations_card_id_locale_pk" PRIMARY KEY("card_id","locale")
);
--> statement-breakpoint
CREATE TABLE "journal_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"date" date NOT NULL,
	"image_path" text,
	"feature" boolean DEFAULT false,
	"status" "journal_status_enum" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "journal_cards_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_application_steps" (
	"product_id" uuid NOT NULL,
	"step_number" integer NOT NULL,
	"locale" "locale_enum" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	CONSTRAINT "product_application_steps_product_id_step_number_locale_pk" PRIMARY KEY("product_id","step_number","locale")
);
--> statement-breakpoint
CREATE TABLE "product_facets" (
	"product_id" uuid NOT NULL,
	"facet_id" uuid NOT NULL,
	CONSTRAINT "product_facets_product_id_facet_id_pk" PRIMARY KEY("product_id","facet_id")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"path" text NOT NULL,
	"alt_text" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_translations" (
	"product_id" uuid NOT NULL,
	"locale" "locale_enum" NOT NULL,
	"name" text NOT NULL,
	"short" text NOT NULL,
	"lede" text,
	CONSTRAINT "product_translations_product_id_locale_pk" PRIMARY KEY("product_id","locale")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"ritual_id" text,
	"subcategory_id" uuid,
	"moq" integer NOT NULL,
	"formats" text[] DEFAULT '{}'::text[] NOT NULL,
	"lead" text NOT NULL,
	"origin" text,
	"ritual_label" text,
	"hero" boolean DEFAULT false,
	"status" "product_status_enum" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "ritual_subcategories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ritual_id" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "ritual_subcategory_translations" (
	"subcategory_id" uuid NOT NULL,
	"locale" "locale_enum" NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "ritual_subcategory_translations_subcategory_id_locale_pk" PRIMARY KEY("subcategory_id","locale")
);
--> statement-breakpoint
CREATE TABLE "ritual_translations" (
	"ritual_id" text NOT NULL,
	"locale" "locale_enum" NOT NULL,
	"eyebrow" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"lede" text NOT NULL,
	CONSTRAINT "ritual_translations_ritual_id_locale_pk" PRIMARY KEY("ritual_id","locale")
);
--> statement-breakpoint
CREATE TABLE "rituals" (
	"id" text PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"hero_image_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "atelier_translations" ADD CONSTRAINT "atelier_translations_atelier_id_ateliers_id_fk" FOREIGN KEY ("atelier_id") REFERENCES "public"."ateliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_items" ADD CONSTRAINT "inquiry_items_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_items" ADD CONSTRAINT "inquiry_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_card_translations" ADD CONSTRAINT "journal_card_translations_card_id_journal_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."journal_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_application_steps" ADD CONSTRAINT "product_application_steps_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_facets" ADD CONSTRAINT "product_facets_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_facets" ADD CONSTRAINT "product_facets_facet_id_facets_id_fk" FOREIGN KEY ("facet_id") REFERENCES "public"."facets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_ritual_id_rituals_id_fk" FOREIGN KEY ("ritual_id") REFERENCES "public"."rituals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_ritual_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."ritual_subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ritual_subcategories" ADD CONSTRAINT "ritual_subcategories_ritual_id_rituals_id_fk" FOREIGN KEY ("ritual_id") REFERENCES "public"."rituals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ritual_subcategory_translations" ADD CONSTRAINT "ritual_subcategory_translations_subcategory_id_ritual_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."ritual_subcategories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ritual_translations" ADD CONSTRAINT "ritual_translations_ritual_id_rituals_id_fk" FOREIGN KEY ("ritual_id") REFERENCES "public"."rituals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_entity_type_entity_id_created_at_idx" ON "audit_log" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_actor_id_created_at_idx" ON "audit_log" USING btree ("actor_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "facets_type_value_en_idx" ON "facets" USING btree ("type","value_en");--> statement-breakpoint
CREATE INDEX "inquiries_status_created_at_idx" ON "inquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "inquiries_email_idx" ON "inquiries" USING btree ("email");--> statement-breakpoint
CREATE INDEX "journal_cards_status_date_idx" ON "journal_cards" USING btree ("status","date");--> statement-breakpoint
CREATE INDEX "product_images_product_id_sort_order_idx" ON "product_images" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_status_ritual_hero_idx" ON "products" USING btree ("status","ritual_id","hero");--> statement-breakpoint
CREATE UNIQUE INDEX "ritual_subcategories_ritual_id_slug_idx" ON "ritual_subcategories" USING btree ("ritual_id","slug");

-- Foreign keys to auth.users (Drizzle schema does not model the auth schema directly)
ALTER TABLE "products"
  ADD CONSTRAINT "products_created_by_auth_users_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL,
  ADD CONSTRAINT "products_updated_by_auth_users_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE "journal_cards"
  ADD CONSTRAINT "journal_cards_created_by_auth_users_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL,
  ADD CONSTRAINT "journal_cards_updated_by_auth_users_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE "inquiries"
  ADD CONSTRAINT "inquiries_assigned_to_auth_users_fk" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE "audit_log"
  ADD CONSTRAINT "audit_log_actor_id_auth_users_fk" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE "admin_users"
  ADD CONSTRAINT "admin_users_id_auth_users_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;