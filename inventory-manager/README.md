# 📦 Inventory Manager

A full-stack inventory management web app: track products, quantities, prices and stock levels through a clean REST API and a modern React UI.

Built as a portfolio project demonstrating a **Spring Boot 3 + JPA backend** and a **React 18 + TypeScript + Vite frontend** working together over a typed REST contract.

![stack](https://img.shields.io/badge/Spring%20Boot-3.2-6db33f) ![java](https://img.shields.io/badge/Java-17-orange) ![react](https://img.shields.io/badge/React-18-61dafb) ![ts](https://img.shields.io/badge/TypeScript-5-3178c6)

## ✨ Features

- **Product CRUD** — create, read, update and delete products with a modal form and delete confirmation
- **Search & filtering** — case-insensitive name search plus category filter dropdown
- **Pagination** — server-side paging with Spring Data `Pageable`
- **Low-stock alerts** — products at or below their threshold get a warning badge and are counted on the dashboard
- **Dashboard** — total products, total inventory value, low-stock count
- **Validation** — bean validation on the API (unique SKU, non-negative quantity/price) surfaced as structured JSON errors, mirrored in the UI
- **API docs** — auto-generated Swagger UI via Springdoc OpenAPI

## 🛠️ Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3, Spring Data JPA, Hibernate, Bean Validation |
| Database | H2 (in-memory, default) · PostgreSQL (profile) |
| API docs | Springdoc OpenAPI (Swagger UI) |
| Frontend | React 18, TypeScript, Vite |
| Styling | Plain modern CSS (no UI framework) |

## 📁 Project structure

```
inventory-manager/
├── backend/                          # Spring Boot REST API (Maven)
│   ├── src/main/java/com/jackoup/inventory/
│   │   ├── controller/ProductController.java
│   │   ├── service/ProductService.java
│   │   ├── repository/ProductRepository.java
│   │   ├── model/Product.java
│   │   ├── dto/InventoryStats.java
│   │   ├── exception/                # ApiError, GlobalExceptionHandler, ...
│   │   └── config/OpenApiConfig.java
│   ├── src/main/resources/
│   │   ├── application.yml           # default (H2) + postgres profiles
│   │   └── data.sql                  # demo seed data (H2 only)
│   └── src/test/java/...             # controller + service tests
├── frontend/                         # React + TypeScript + Vite
│   └── src/
│       ├── api/client.ts             # typed fetch client
│       ├── components/               # Dashboard, ProductTable, modals, ...
│       ├── App.tsx
│       └── types.ts
├── docker-compose.yml                # PostgreSQL for the postgres profile
└── README.md
```

## 🚀 Running it

You need **Java 17+**, **Maven**, and **Node.js 18+**.

### 1. Backend

```bash
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080` with demo data pre-loaded (H2 in-memory).

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 console: `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:inventorydb`, user `sa`, no password)

**With PostgreSQL** instead of H2:

```bash
docker compose up -d            # starts Postgres on localhost:5432
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. In development, `/api` requests are proxied to the backend. For a production build against a remote API, set `VITE_API_URL` (see `frontend/.env.example`).

### 3. Tests (backend)

```bash
cd backend
mvn test
```

## 🔌 API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List products — `page`, `size`, `sort`, `name`, `category` params |
| `GET` | `/api/products/{id}` | Get one product |
| `POST` | `/api/products` | Create a product (201) |
| `PUT` | `/api/products/{id}` | Update a product |
| `DELETE` | `/api/products/{id}` | Delete a product (204) |
| `GET` | `/api/products/stats` | `{ totalProducts, inventoryValue, lowStockCount }` |
| `GET` | `/api/products/categories` | Distinct category list |

Error responses follow a consistent shape, e.g. validation failures return `400` with a `fieldErrors` map:

```json
{
  "timestamp": "2026-09-30T19:00:00Z",
  "status": 400,
  "error": "Validation failed",
  "message": "One or more fields are invalid",
  "path": "/api/products",
  "fieldErrors": { "sku": "SKU is required", "quantity": "Quantity cannot be negative" }
}
```

## 🔮 Future improvements

- Authentication & authorization (Spring Security + JWT) with per-user inventories
- Stock movement history / audit log per product
- CSV import/export of the product catalog
- Docker images for backend + frontend and a full `docker compose` stack
- Optimistic locking (`@Version`) to handle concurrent stock updates
- Frontend: debounced search, sorting by column, dark mode

## 📄 License

MIT — see [LICENSE](LICENSE).
