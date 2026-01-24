-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variants" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "price_modifier" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_products" (
    "product_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "category_products_pkey" PRIMARY KEY ("product_id","category_id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_modifier" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_items" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_variant_id" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "deal_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "products"("created_at");

-- CreateIndex
CREATE INDEX "products_deleted_at_idx" ON "products"("deleted_at");

-- CreateIndex
CREATE INDEX "variants_product_id_idx" ON "variants"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "variants_product_id_label_key" ON "variants"("product_id", "label");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_created_at_idx" ON "categories"("created_at");

-- CreateIndex
CREATE INDEX "categories_deleted_at_idx" ON "categories"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "deals_slug_key" ON "deals"("slug");

-- CreateIndex
CREATE INDEX "deals_created_at_idx" ON "deals"("created_at");

-- CreateIndex
CREATE INDEX "deals_deleted_at_idx" ON "deals"("deleted_at");

-- CreateIndex
CREATE INDEX "deal_items_deal_id_idx" ON "deal_items"("deal_id");

-- CreateIndex
CREATE INDEX "deal_items_product_id_idx" ON "deal_items"("product_id");

-- CreateIndex
CREATE INDEX "deal_items_product_variant_id_idx" ON "deal_items"("product_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "deal_items_deal_id_product_id_product_variant_id_key" ON "deal_items"("deal_id", "product_id", "product_variant_id");

-- AddForeignKey
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_products" ADD CONSTRAINT "category_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_products" ADD CONSTRAINT "category_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_items" ADD CONSTRAINT "deal_items_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_items" ADD CONSTRAINT "deal_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_items" ADD CONSTRAINT "deal_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Creating Custom Constraints
ALTER TABLE "products"
    ADD CONSTRAINT "products_name_length" CHECK (LENGTH("name") >= 3),
    ADD CONSTRAINT "products_sku_format" CHECK ("sku" ~ '^[A-Z0-9-]+$' AND LENGTH("sku") >= 6 AND LENGTH("sku") <= 12),
    ADD CONSTRAINT "products_slug_format" CHECK ("slug" ~ '^[a-z0-9-]+$' AND LENGTH("slug") >= 3),
    ADD CONSTRAINT "products_base_price_non_negative" CHECK ("base_price" >= 0);

ALTER TABLE "variants"
    ADD CONSTRAINT "variants_label_length" CHECK (LENGTH("label") >= 2),
    ADD CONSTRAINT "variants_price_modifier_non_negative" CHECK ("price_modifier" >= 0);

ALTER TABLE "categories"
    ADD CONSTRAINT "categories_name_length" CHECK (LENGTH("name") >= 3),
    ADD CONSTRAINT "categories_slug_format" CHECK ("slug" ~ '^[a-z0-9-]+$' AND LENGTH("slug") >= 3);

ALTER TABLE "deals"
    ADD CONSTRAINT "deals_name_length" CHECK (LENGTH("name") >= 3),
    ADD CONSTRAINT "deals_slug_format" CHECK ("slug" ~ '^[a-z0-9-]+$' AND LENGTH("slug") >= 3),
    ADD CONSTRAINT "deals_date_consistency" CHECK ("start_date" IS NULL OR "end_date" IS NULL OR "start_date" <= "end_date");

ALTER TABLE "deal_items"
    ADD CONSTRAINT "deal_items_quantity_positive" CHECK ("quantity" > 0);

-- Adding partial unique constraint to deal_items
CREATE UNIQUE INDEX "unique_deal_item_without_variant" ON "deal_items"("deal_id", "product_id") WHERE "product_variant_id" IS NULL;
