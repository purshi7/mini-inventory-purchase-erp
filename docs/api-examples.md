# API Examples (to implement)

## Create vendor
`POST /api/vendors`
```json
{
  "name": "Mysore Glass Suppliers",
  "email": "orders@example.com",
  "phone": "+91-9000000000"
}
```

## Create product
`POST /api/products`
```json
{
  "sku": "GLASS-001",
  "name": "Clear Glass Sheet",
  "unit": "sheet"
}
```

## Create purchase order
`POST /api/purchase-orders`
```json
{
  "vendorId": 1,
  "items": [
    { "productId": 1, "quantity": 20, "unitPrice": 500.00 }
  ]
}
```

## Receive goods
`POST /api/goods-receipts`
```json
{
  "idempotencyKey": "receipt-client-generated-unique-key",
  "purchaseOrderId": 1,
  "items": [
    { "purchaseOrderItemId": 1, "quantity": 10 }
  ]
}
```

## Record vendor payment
`POST /api/vendor-payments`
```json
{
  "idempotencyKey": "payment-client-generated-unique-key",
  "vendorId": 1,
  "amount": 2500.00,
  "method": "BANK_TRANSFER",
  "referenceNumber": "UTR-EXAMPLE"
}
```

These are proposed request formats; update them alongside the actual DTOs and controllers.
