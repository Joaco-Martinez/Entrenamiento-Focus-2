-- Soft-delete para VideoClass: permite "borrar" una clase que ya tuvo algún
-- OrderItem asociado (comprada o no) sin violar OrderItem_product_or_class_check
-- / AccessGrant_product_or_class_check, que exigen que esas filas sigan
-- apuntando a una VideoClass existente. Columna nullable, sin backfill: todas
-- las filas existentes quedan con deletedAt = NULL (activas).
ALTER TABLE "VideoClass" ADD COLUMN "deletedAt" TIMESTAMP(3);
