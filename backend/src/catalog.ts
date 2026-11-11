import type { RowDataPacket } from 'mysql2/promise'

export interface CatalogRow extends RowDataPacket {
  catalogVersion: string | null
  menuItemId: number | null
  name: string | null
  variantId: number | null
  variantName: string | null
  price: string | null
}

export const connectionTestSql = `
  SELECT
    (SELECT CAST(Version AS CHAR) FROM CATALOG_VERSION WHERE CatalogKey = ?) AS catalogVersion,
    product.*
  FROM (SELECT 1) AS probe
  LEFT JOIN (
    SELECT m.MenuItemID AS menuItemId, m.Name AS name,
           v.VariantID AS variantId, v.VariantName AS variantName,
           CAST(v.Price AS CHAR) AS price
    FROM MENU_ITEM AS m
    JOIN MENU_ITEM_VARIANT AS v ON v.MenuItemID = m.MenuItemID
    WHERE m.Status = 'Active' AND v.IsAvailable = 1
    ORDER BY m.MenuItemID, v.DisplayOrder, v.VariantID
    LIMIT 1
  ) AS product ON TRUE
`

export function catalogResponse(row: CatalogRow) {
  const product = row.menuItemId === null ? null : {
    menuItemId: row.menuItemId,
    name: row.name,
    variantId: row.variantId,
    variantName: row.variantName,
    price: row.price,
  }
  return {
    status: 'connected' as const,
    catalogKey: 'public_catalog' as const,
    catalogVersion: row.catalogVersion,
    empty: product === null,
    product,
  }
}

export type CatalogResult = ReturnType<typeof catalogResponse>
