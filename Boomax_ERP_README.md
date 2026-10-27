# Mini Inventory & Purchase ERP

A full-stack inventory and purchasing application built for the Boomax Full Stack Developer practical coding assessment.

## Overview

The application supports the main vendor-to-purchase-to-stock workflow:

- Create and update vendors.
- Create and update products and view current stock.
- Create and view purchase orders with product quantities and unit prices.
- Record goods receipts against purchase-order items.
- Increase product stock and create stock-movement records for receipts.
- Record vendor payments and view vendor payment history.
- View a vendor outstanding report showing purchase totals, payments and balance.

## Technology stack

- **Backend:** Java 21, Spring Boot 3.4.2, Spring Data JPA, Bean Validation
- **Database:** PostgreSQL with Flyway SQL migrations
- **Frontend:** React 18, TypeScript, Vite
- **Build tools:** Maven and npm

**Database note:** The original assessment brief names MySQL. This implementation uses PostgreSQL as the agreed database substitution. The migrations and setup instructions below are for PostgreSQL; they are not MySQL scripts.

## Project structure

```text
mini-inventory-purchase-erp-project/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/boomax/inventoryerp/
│       │   ├── controller/       # REST controllers
│       │   ├── dto/              # API request/response models
│       │   ├── entity/           # JPA entities
│       │   ├── repository/       # Spring Data repositories
│       │   └── service/          # Business logic
│       ├── main/resources/
│       │   ├── application.yml
│       │   └── db/migration/     # Flyway migrations V1–V4
│       └── test/                 # Automated test source
├── frontend/
│   ├── src/                      # React screens and API client
│   ├── package.json
│   └── vite.config.ts
└── docs/
    └── api-examples.md
```

## Prerequisites

Install the following before running the application:

- Java JDK 21
- Maven 3.9 or later
- Node.js 20 or later and npm
- PostgreSQL 15 or later

The project archive does not include a Maven Wrapper, so the `mvn` command must be available in your terminal.

## Setup and run on Windows (PowerShell)

### 1. Create the database

Start PostgreSQL, open pgAdmin or `psql`, and create the database:

```sql
CREATE DATABASE inventory_erp;
```

Use an existing PostgreSQL database instead if one has already been created. The user configured below must have permission to create tables and indexes in this database.

### 2. Configure and start the backend

Open a PowerShell terminal at the project root and run:

```powershell
cd backend

$env:SERVER_PORT = "8081"
$env:DB_URL = "jdbc:postgresql://localhost:5432/inventory_erp"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "YOUR_LOCAL_POSTGRES_PASSWORD"

mvn spring-boot:run
```

Replace `YOUR_LOCAL_POSTGRES_PASSWORD` with your local PostgreSQL password. Do not commit the real password to source control or include it in the submission ZIP.

The backend configuration reads these environment variables:

| Variable | Purpose | Default |
|---|---|---|
| `SERVER_PORT` | Backend HTTP port | `8080` |
| `DB_URL` | JDBC database URL | `jdbc:postgresql://localhost:5432/inventory_erp` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | Required; set it before starting |

The frontend Vite proxy targets `http://localhost:8081`, so set `SERVER_PORT` to `8081` as shown above. Flyway applies the SQL migrations at backend startup. Hibernate is configured to validate the schema rather than create tables automatically.

Keep the backend terminal open while using the application.

### 3. Install and start the frontend

Open a **second** PowerShell terminal at the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally:

- Frontend: http://localhost:5173
- Backend: http://localhost:8081

The frontend sends `/api` requests through the Vite proxy to the backend. If the page loads but API requests fail, check that PostgreSQL and the backend are running and that the backend port matches the proxy target.

### 4. Build checks

Frontend production build:

```powershell
cd frontend
npm run build
```

Backend compile:

```powershell
cd backend
mvn clean compile
```

The automated backend test includes a Spring application-context test and needs a reachable PostgreSQL database because Flyway migrations run during startup. Run tests from `backend/` with:

```powershell
mvn test
```

## API reference

Base URL: `http://localhost:8081`

The following endpoints are defined in the current controllers. All request bodies use JSON.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/vendors` | Create a vendor |
| `GET` | `/api/vendors` | List vendors |
| `PUT` | `/api/vendors/{id}` | Update a vendor |
| `POST` | `/api/products` | Create a product |
| `GET` | `/api/products` | List products, including current stock |
| `PUT` | `/api/products/{id}` | Update a product |
| `POST` | `/api/purchase-orders` | Create a purchase order |
| `GET` | `/api/purchase-orders` | List purchase orders |
| `POST` | `/api/goods-receipts` | Record goods received and update stock |
| `POST` | `/api/vendor-payments` | Record a vendor payment |
| `GET` | `/api/vendor-payments` | List vendor payments |
| `GET` | `/api/vendor-payments/vendor/{vendorId}` | List payments for one vendor |
| `GET` | `/api/vendor-payments/outstanding` | List outstanding balances for vendors |
| `GET` | `/api/vendor-payments/outstanding/vendor/{vendorId}` | Get one vendor's outstanding balance |

Current stock is returned by `GET /api/products`; this project does not define a separate `/api/inventory` controller endpoint.

### Example: create a vendor

`POST /api/vendors`

```json
{
  "name": "Mysore Glass Suppliers",
  "email": "orders@example.com",
  "phone": "+91-9000000000",
  "address": "Mysuru, Karnataka"
}
```

### Example: create a product

`POST /api/products`

```json
{
  "sku": "GLASS-001",
  "name": "Clear Glass Sheet",
  "description": "Sample glass sheet",
  "unit": "sheet"
}
```

### Example: create a purchase order

`POST /api/purchase-orders`

Use existing vendor and product IDs returned by the API. `quantity` and `unitPrice` must be positive.

```json
{
  "vendorId": 1,
  "notes": "Assessment test order",
  "items": [
    {
      "productId": 1,
      "quantity": 20,
      "unitPrice": 500.00
    }
  ]
}
```

### Example: receive goods

`POST /api/goods-receipts`

`purchaseOrderItemId` must identify an item belonging to the specified purchase order. `receivedQuantity` must be positive and must not exceed the remaining ordered quantity. Use a unique idempotency key for each new receipt; retry the same request with the same key when testing duplicate protection.

```json
{
  "purchaseOrderId": 1,
  "idempotencyKey": "receipt-test-9ad4c0ed-4e25-4ebd-9a5a-0cae9a5c15fd",
  "notes": "Sample delivery",
  "items": [
    {
      "purchaseOrderItemId": 1,
      "receivedQuantity": 10
    }
  ]
}
```

A successful request should return a created receipt identifier and receipt number. Before submission, verify at runtime that the receipt, stock update and stock movement are all saved correctly and that replaying the same idempotency key does not increase stock a second time.

### Example: record a vendor payment

`POST /api/vendor-payments`

Payment methods supported by the backend are `CASH`, `BANK_TRANSFER`, `CHEQUE`, `UPI`, and `OTHER`. A payment amount must be positive and must not exceed the calculated outstanding balance.

```json
{
  "vendorId": 1,
  "idempotencyKey": "payment-test-90cb1f14-5a65-4c1a-9cf7-a36af8601e8e",
  "amount": 2500.00,
  "paymentDate": "2026-10-27",
  "method": "BANK_TRANSFER",
  "referenceNumber": "UTR-EXAMPLE",
  "notes": "Assessment test payment"
}
```

## Business rules and design decisions

1. Vendors and products are stored separately and referenced by purchase orders.
2. Purchase orders contain one or more items with positive quantities and unit prices; order totals are calculated by the backend.
3. A goods receipt is tied to a purchase order. Received quantities are added to the associated product stock and a stock-movement record is created.
4. Goods receipt creation is marked transactional so related database changes should commit or roll back together. Runtime verification is still required after the final stock-movement mapping changes.
5. Receipt idempotency keys are used to avoid processing the same receipt twice. Payment idempotency keys are also checked, with conflicting reuse rejected by the payment service.
6. **Payable policy:** this implementation calculates a vendor's purchase total as the sum of non-cancelled purchase-order totals, then subtracts the sum of recorded vendor payments. Therefore, payable is based on purchase orders, not only on the quantities received. Payments are recorded against a vendor rather than allocated to individual invoices.
7. The vendor report calculates purchase totals and payment totals separately before subtracting them, avoiding inflated totals from joining multiple one-to-many relationships.
8. PostgreSQL is used with Flyway-managed migrations `V1` through `V4`. `ddl-auto` is set to `validate` so entity/database differences surface at startup.
9. No authentication/authorization workflow is implemented in this assessment application. Do not expose it publicly with real data or credentials.

## Manual test checklist

Record the actual results of these cases before submission; don't mark a case as passed unless you have run it.

- [ ] Create a vendor with valid data; verify it appears in the list.
- [ ] Reject a vendor with a missing/invalid required name or invalid email.
- [ ] Create a product; verify it appears with its current stock.
- [ ] Create a purchase order containing one or more products and verify the calculated total.
- [ ] Reject non-positive quantities/prices and nonexistent vendor/product IDs.
- [ ] Receive a valid quantity and verify stock increases by exactly that quantity.
- [ ] Verify a stock-movement row is created for the receipt.
- [ ] Retry the same receipt idempotency key and verify there is no second stock increase.
- [ ] Reject a receipt quantity exceeding the remaining ordered quantity.
- [ ] Record a valid vendor payment and verify the outstanding balance decreases.
- [ ] Reject an overpayment and verify no payment record or financial change is made.
- [ ] Retry the same payment idempotency key and verify no duplicate payment is created.
- [ ] Verify the outstanding report for a vendor with multiple purchase orders and payments.
- [ ] Verify a failed transaction does not leave partial receipt, stock, or payment changes.
- [ ] Run the frontend production build and backend compile/tests.

## API / SQL documentation

- `docs/api-examples.md` contains API request examples; keep it aligned with the actual DTO fields and controller routes documented above.
- Flyway schema scripts are in `backend/src/main/resources/db/migration/`.
- Vendor outstanding balances are calculated by `VendorOutstandingService` using separate purchase-total and payment-total repository queries.

## Known limitations / assumptions

- PostgreSQL is used instead of the MySQL database named in the original brief, with approval as discussed for the assessment.
- Vendor payments are associated with a vendor, not allocated to specific purchase orders/invoices.
- The payable policy is based on non-cancelled purchase-order totals even if an order is only partially received.
- The automated test source currently contains a context-load test; the business-rule cases above should be run and recorded as manual tests unless additional automated tests are added.
- After the final `StockMovement` mapping fix, the goods-receipt workflow needs a successful runtime test against the database before it can be described as fully verified.

## AI assistance disclosure

AI assistance was used to help draft project documentation, review code structure, and troubleshoot the stock-movement entity/database mapping. The implementation and suggestions should be reviewed and understood by the candidate. Before submission, update this disclosure to accurately state what was used and which checks were actually run. Do not claim that any test passed unless it was executed and verified.

## Actual time spent

**Actual time spent:** `[Enter your actual total time spent on this assessment]`

The assessment allows up to eight hours. Enter the true elapsed time; do not estimate or claim the full eight hours unless accurate.

## Submission checklist

- [ ] Remove generated folders such as `backend/target/` and `frontend/node_modules/` from the ZIP; reviewers can recreate them using Maven and npm.
- [ ] Remove local error logs and all secrets, passwords, `.env` files containing credentials, and personal/customer data.
- [ ] Include backend and frontend source, Flyway migrations, this README, API examples and test evidence.
- [ ] Confirm a reviewer can start the database, backend and frontend using the steps above.
- [ ] Verify the goods receipt and duplicate-receipt behavior at runtime before submitting.
