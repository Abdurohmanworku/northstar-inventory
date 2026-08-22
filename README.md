# Northstar Inventory API

A serverless REST API prototype for **Northstar Retail Co.** Support agents can query inventory in real time and update stock quantities through Vercel Functions.

## Project Information

- **Sprint:** The Meridian Pivot — Northstar Retail Co.
- **Platform:** Vercel Functions (Node.js 20.x)
- **Language:** JavaScript (ES Modules)
- **Deployment:** [northstar-inventory.vercel.app](https://northstar-inventory.vercel.app/)

## Features

- Query a single inventory item by ID.
- Retrieve the complete inventory list.
- Update stock quantities with a POST request.
- Automatically calculate whether an item is in stock.
- Validate missing and unknown item IDs.
- Return useful HTTP status codes and JSON error messages.
- Run locally with the Vercel development server.

## Project Structure

```text
northstar-inventory/
├── api/
│   ├── stock.js            → GET  /api/stock?itemId={id}
│   └── stock/
│       ├── all.js          → GET  /api/stock/all
│       └── update.js       → POST /api/stock/update
├── lib/
│   └── supabase.js         → shared inventory data
├── index.html              → frontend
├── vercel.json             → Vercel configuration
└── package.json            → project metadata and dependencies
```

Vercel uses file-based routing. For example, `api/stock/all.js` automatically maps to `/api/stock/all`.

## Requirements

- Node.js 18 or later.
- npm.
- A Vercel account for deployment.
- PowerShell, `curl`, or another HTTP client for testing.

## Local Installation

1. Clone or download the project.

2. Open a terminal in the project directory:

   ```bash
   cd northstar-inventory
   ```

3. Check the Node.js version:

   ```bash
   node -v
   ```

4. Install the Vercel CLI globally:

   ```bash
   npm i -g vercel
   ```

5. Log in to Vercel:

   ```bash
   vercel login
   ```

6. Start the local development server:

   ```bash
   vercel dev
   ```

The application should be available at:

```text
http://localhost:3000
```

## API Reference

### Get one item

```http
GET /api/stock?itemId=A001
```

Example response:

```json
{
  "itemId": "A001",
  "name": "Blue T-Shirt (M)",
  "quantity": 42,
  "inStock": true,
  "checkedAt": "2026-08-18T04:57:56.613Z"
}
```

Possible responses:

- `200 OK` — item found.
- `400 Bad Request` — `itemId` is missing.
- `404 Not Found` — item does not exist.

### Get all items

```http
GET /api/stock/all
```

Example response:

```json
{
  "items": [
    {
      "itemId": "A001",
      "name": "Blue T-Shirt (M)",
      "quantity": 42,
      "inStock": true
    },
    {
      "itemId": "A002",
      "name": "Running Shoes (42)",
      "quantity": 0,
      "inStock": false
    }
  ],
  "totalItems": 5,
  "inStockCount": 3,
  "outOfStock": 2,
  "retrievedAt": "2026-08-18T04:58:00.065Z"
}
```

### Update stock

```http
POST /api/stock/update
Content-Type: application/json
```

Request body:

```json
{
  "itemId": "A002",
  "quantity": 10
}
```

PowerShell example:

```powershell
Invoke-WebRequest -UseBasicParsing -Method POST `
  "http://localhost:3000/api/stock/update" `
  -ContentType "application/json" `
  -Body '{"itemId":"A002","quantity":10}'
```

Example response:

```json
{
  "message": "Stock updated successfully",
  "itemId": "A002",
  "updated": {
    "name": "Running Shoes (42)",
    "quantity": 10,
    "inStock": true
  },
  "updatedAt": "2026-08-18T04:58:01.980Z"
}
```

## Testing

### Query an in-stock item

```powershell
Invoke-WebRequest -UseBasicParsing `
  "http://localhost:3000/api/stock?itemId=A001"
```

Expected result: `200 OK`, with quantity `42` and `inStock: true`.

### Query an out-of-stock item

```powershell
Invoke-WebRequest -UseBasicParsing `
  "http://localhost:3000/api/stock?itemId=A002"
```

Expected result: `200 OK`, with quantity `0` and `inStock: false`.

### Query all inventory

```powershell
Invoke-WebRequest -UseBasicParsing `
  "http://localhost:3000/api/stock/all"
```

Expected result: all five items, three in stock, and two out of stock.

### Test a missing parameter

```powershell
Invoke-WebRequest -UseBasicParsing `
  "http://localhost:3000/api/stock"
```

Expected result: `400 Bad Request`.

### Test an unknown item

```powershell
Invoke-WebRequest -UseBasicParsing `
  "http://localhost:3000/api/stock?itemId=Z999"
```

Expected result: `404 Not Found`.

## Deployment

Deploy the project to Vercel with:

```bash
vercel deploy --prod
```

After deployment, the API routes are available under the production domain:

```text
https://northstar-inventory.vercel.app/api/stock?itemId=A001
https://northstar-inventory.vercel.app/api/stock/all
https://northstar-inventory.vercel.app/api/stock/update
```

## Serverless Architecture Notes

Vercel Functions are stateless. Each function can run in an isolated instance, so an in-memory inventory object is not guaranteed to be shared between different endpoints or invocations.

For example, a POST request to `/api/stock/update` may update one function instance's local copy while `/api/stock` reads another copy. This means in-memory updates should not be treated as persistent production data.

A production implementation should store inventory in a shared external database, such as Supabase, Redis, or PlanetScale. All functions can then read from and write to the same persistent data source.

## Troubleshooting

### `vercel` is not recognized

Install the Vercel CLI globally:

```bash
npm i -g vercel
```

Then verify the installation:

```bash
vercel --version
```

### ES module import errors

Use one module system consistently. For ES Modules, configure `package.json` with:

```json
{
  "type": "module"
}
```

Then use `import` and `export` syntax. If using CommonJS, use `"type": "commonjs"` with `require` and `module.exports`.

### `req.body` is undefined

When sending JSON from PowerShell, include the content type:

```powershell
-ContentType "application/json"
```

Also make sure the request body contains valid JSON.

### PowerShell security warning

Use `-UseBasicParsing` with `Invoke-WebRequest` when testing JSON APIs:

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/stock?itemId=A001"
```

### Route returns 404

Check that the file path matches the intended URL. For example:

```text
api/stock/all.js → /api/stock/all
api/all.js       → /api/all
```

## Learning Resources

- [Vercel Functions](https://vercel.com/docs/functions)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Vercel Body Parsing](https://vercel.com/docs/functions/runtimes/node-js#body-parsing)
- [Vercel File-based Routing](https://vercel.com/docs/functions/runtimes/node-js#routing)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [Node.js crypto module](https://nodejs.org/api/crypto.html)
- [MDN HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [PowerShell Invoke-WebRequest](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-webrequest)
- [Stack Overflow](https://stackoverflow.com)
- [Cloudflare Blog](https://blog.cloudflare.com)

## Author

**Abdurohman Worku Dawud**

