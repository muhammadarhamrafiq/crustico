-- DropForeignKey
ALTER TABLE "deal_items" DROP CONSTRAINT "deal_items_product_variant_id_fkey";

-- AlterTable
ALTER TABLE "variants" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "deal_items" ADD CONSTRAINT "deal_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
