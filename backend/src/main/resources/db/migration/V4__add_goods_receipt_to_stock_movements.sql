ALTER TABLE stock_movements
ADD COLUMN goods_receipt_id BIGINT
REFERENCES goods_receipts(id);