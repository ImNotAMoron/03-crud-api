# CRUD API — Product Catalog

## Installation

1. Run `npm install`
2. Create `.env` based on `.env.example`:
   ```
   cp .env.example .env
   ```

## Running

### Development mode
```bash
npm run start:dev
```
Starts the server in watch mode. Restarts automatically on file changes.

### Production mode
```bash
npm run start:prod
```
Compiles TypeScript to `dist/` and runs the built file.

### Multi-process mode
```bash
npm run start:multi
```
Starts a load balancer on `PORT` and spawns `availableParallelism() - 1` worker

## API

Base URL: `http://localhost:{PORT}`

### GET /api/products

Returns all products.

**Response:** `200 OK`
```json
[
  {
    "id": "763cc4b2-21d2-4aa4-8900-67d5a4f3a189",
    "name": "Laptop",
    "description": "A laptop",
    "price": 999,
    "category": "electronics",
    "inStock": true
  }
]
```

### GET /api/products/:productId

Returns a single product by ID.

**Responses:**
- `200 OK` — product found
- `400 Bad Request` — `productId` is not a valid UUID
- `404 Not Found` — product does not exist

### POST /api/products

Creates a new product.

**Request body:**
```json
{
  "name": "Laptop",
  "description": "A laptop",
  "price": 999,
  "category": "electronics",
  "inStock": true
}
```

**Responses:**
- `201 Created` — returns the newly created product with generated `id`
- `400 Bad Request` — missing required fields or `price` is not a positive number

### PUT /api/products/:productId

Updates an existing product. Request body is the same as POST.

**Responses:**
- `200 OK` — returns the updated product
- `400 Bad Request` — invalid `productId` or invalid body
- `404 Not Found` — product does not exist

### DELETE /api/products/:productId

Deletes a product by ID.

**Responses:**
- `204 No Content` — product deleted
- `400 Bad Request` — `productId` is not a valid UUID
- `404 Not Found` — product does not exist
