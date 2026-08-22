# Independent Learning & Blocker Log

- **Sprint:** The Meridian Pivot — Northstar Retail Co.
- **Tool Assigned:** Serverless Functions
- **Platform chosen:** Vercel Functions (Node.js 20.x)
- **Language:** JavaScript (ES Modules)
- **Student:** Abdurohman Worku Dawud
- **Submission Date:** [Date]
- **Time box:** Days 1–2
- **Live Deployment URL:** [https://northstar-inventory.vercel.app/](https://northstar-inventory.vercel.app/)

## Section 1 — Prototype Overview

### What I built

A 3-endpoint serverless REST API for Northstar Retail Co.'s inventory query service. Support agents call the API to answer “is this item in stock?” in real time. The prototype runs entirely on Vercel's serverless infrastructure—there is no persistent server process.

### Why this tool was genuinely unfamiliar

I had not previously used serverless functions in any form. My prior experience was limited to standard Node.js servers with Express, where a single process stays running and handles all requests. Vercel Functions introduced entirely new concepts: file-based routing, stateless execution, isolated function instances, and platform-managed scaling—none of which I had encountered before.

### Architectural decisions made during learning

While building the prototype, I discovered that serverless functions are stateless by design: each function invocation runs in its own isolated process with no shared memory. This directly informed my design choice: rather than treating the `POST /api/stock/update` endpoint as a generic data mutation route, the warehouse system will call it automatically on every stock change.

## Section 2 — Technical Documentation

### Project file structure

```text
northstar-inventory/
├── api/
│   ├── stock.js            → GET  /api/stock?itemId={id}
│   └── stock/
│       ├── all.js          → GET  /api/stock/all
│       └── update.js       → POST /api/stock/update
├── lib/
│   └── supabase.js         → shared mock inventory data
├── index.html              → frontend
├── vercel.json
└── package.json
```

In Vercel, the file path is the route—no router configuration is needed. `api/stock/all.js` automatically maps to `/api/stock/all`. This is fundamentally different from Express, where routes are defined manually in code.

### Endpoint reference

| Method | Route | Purpose | Key behaviours |
|---|---|---|---|
| GET | `/api/stock?itemId=A001` | Query single item | 400 if no `itemId`; 404 if unknown; 200 with stock object |
| GET | `/api/stock/all` | List full inventory | Returns all items, counts, and timestamp |
| POST | `/api/stock/update` | Update stock quantity | Accepts `{ itemId, quantity }`; validates types; updates cache |

### Key technical concept learned: stateless execution

Each Vercel function runs in an isolated instance. The inventory object defined in `lib/inventory.js` is imported separately by each function; they do not share the same object in memory. A POST to `/api/stock/update` updates one instance's copy, while the GET `/api/stock` function reads a different copy and remains unchanged.

This is expected behaviour in serverless architecture. In production, shared state must live in an external database such as Redis, Supabase, or PlanetScale that all function instances can read from and write to.

### Local development setup

```bash
node -v             # must be 18+
npm i -g vercel     # install CLI
vercel login        # authenticate
vercel dev          # start local server at http://localhost:3000
```

## Section 3 — Functional Correctness Evidence

All six test cases were run locally against `http://localhost:3000` using PowerShell's `Invoke-WebRequest`.

### Test 1 — GET single item (in stock)

**Command:**

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/stock?itemId=A001"
```

**Response:**

```text
StatusCode : 200
Content    : {"itemId":"A001","name":"Blue T-Shirt (M)","quantity":42,
             "inStock":true,"checkedAt":"2026-08-18T04:57:56.613Z"}
```

**Result:** PASS — item found, correct stock data returned, and timestamp included.

### Test 2 — GET single item (out of stock)

**Command:**

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/stock?itemId=A002"
```

**Response:**

```text
StatusCode : 200
Content    : {"itemId":"A002","name":"Running Shoes (42)","quantity":0,
             "inStock":false,"checkedAt":"2026-08-18T04:57:58.243Z"}
```

**Result:** PASS — the out-of-stock item correctly returned `"inStock": false` and `"quantity": 0`.

### Test 3 — GET all items

**Command:**

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/stock/all"
```

**Response:**

```json
{
  "items": [
    {"itemId":"A001","name":"Blue T-Shirt (M)","quantity":42,"inStock":true},
    {"itemId":"A002","name":"Running Shoes (42)","quantity":0,"inStock":false},
    {"itemId":"A003","name":"Leather Wallet","quantity":15,"inStock":true},
    {"itemId":"A004","name":"Wireless Earbuds","quantity":3,"inStock":true},
    {"itemId":"A005","name":"Yoga Mat","quantity":0,"inStock":false}
  ],
  "totalItems": 5,
  "inStockCount": 3,
  "outOfStock": 2,
  "retrievedAt": "2026-08-18T04:58:00.065Z"
}
```

**Result:** PASS — all five items were returned, with counts of three in stock and two out of stock.

### Test 4 — POST update stock

**Command:**

```powershell
Invoke-WebRequest -UseBasicParsing -Method POST `
  "http://localhost:3000/api/stock/update" `
  -ContentType "application/json" `
  -Body '{"itemId":"A002","quantity":10}'
```

**Response:**

```text
StatusCode : 200
Content    : {"message":"Stock updated successfully","itemId":"A002",
             "updated":{"name":"Running Shoes (42)","quantity":10,"inStock":true},
             "updatedAt":"2026-08-18T04:58:01.980Z"}
```

**Result:** PASS — quantity updated from 0 to 10, and `inStock` automatically changed to `true`.

### Test 5 — Error handling (missing parameter)

**Command:**

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/stock"
```

**Response:**

```json
{
  "error": "Missing required query parameter: itemId",
  "example": "/api/stock?itemId=A001"
}
```

**Result:** PASS — status 400 was returned correctly when the required parameter was absent.

### Test 6 — Error handling (unknown item)

**Command:**

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/stock?itemId=Z999"
```

**Response:**

```json
{
  "error": "Item 'Z999' not found",
  "availableIds": ["A001", "A002", "A003", "A004", "A005"]
}
```

**Result:** PASS — status 404 was returned for the unknown item, and available IDs were listed to aid debugging.

## Section 4 — Resources Consulted

| # | Resource | URL | Used for |
|---:|---|---|---|
| 1 | Vercel Functions overview | [Vercel Functions](https://vercel.com/docs/functions) | Initial concepts and what serverless means |
| 2 | Vercel CLI docs | [Vercel CLI](https://vercel.com/docs/cli) | Install command, `vercel dev`, and `vercel deploy` |
| 3 | Vercel — Body Parsing | [Body Parsing](https://vercel.com/docs/functions/runtimes/node-js#body-parsing) | Debugging `req.body` being undefined (Blocker 3) |
| 4 | Vercel — File-based Routing | [File-based Routing](https://vercel.com/docs/functions/runtimes/node-js#routing) | Understanding why routes returned 404 (Blocker 6) |
| 5 | Node.js — ES Modules | [Node.js ES Modules](https://nodejs.org/api/esm.html) | Fixing import syntax errors (Blocker 2) |
| 6 | Node.js — crypto module | [Node.js crypto](https://nodejs.org/api/crypto.html) | HMAC signature verification preparation for Day 4 |
| 7 | MDN — HTTP Status Codes | [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) | Choosing correct status codes for responses |
| 8 | Stack Overflow | [Stack Overflow](https://stackoverflow.com) | `vercel req.body undefined`; Content-Type fix |
| 9 | Cloudflare blog | [Cloudflare Blog](https://blog.cloudflare.com) | Why serverless functions are stateless (Blocker 4) |
| 10 | PowerShell docs | [PowerShell](https://learn.microsoft.com/en-us/powershell) | `Invoke-WebRequest` usage and `-UseBasicParsing` |

No teammate or instructor was consulted for technical how-to guidance during Days 1–2. All resources above were public documentation.

## Section 5 — Blocker Log

### Blocker 1 — Day 1 · 11:00 AM

**What I was trying to do:** Start the local development server by running `vercel dev` in the terminal.

**Error / symptom:**

```text
'vercel' is not recognized as an internal or external command
```

**First thing I tried:** Ran `vercel dev` directly, assuming it came bundled with Node.js like `node` and `npm`.

**Resource that helped:** [Vercel CLI docs](https://vercel.com/docs/cli). I found the install command under “Getting Started.”

**Fix I applied:**

```bash
npm i -g vercel
vercel --version   # confirmed: 39.x.x
vercel dev         # server started at localhost:3000
```

**Why it worked:** `vercel` is a separate CLI package, not part of Node.js. The `-g` flag installs it globally, making the command available system-wide in any terminal session.

### Blocker 2 — Day 1 · 11:10 AM

**What I was trying to do:** Import the shared inventory object from `lib/inventory.js` into `api/stock.js` using import syntax.

**Error / symptom:**

```text
SyntaxError: Cannot use import statement in a module
```

Switching to `require()` produced a different error:

```text
ReferenceError: require is not defined in ES module scope
```

**First thing I tried:** Switched between `import` and `require` multiple times; both failed in different ways.

**Resource that helped:** [Node.js ES Modules documentation](https://nodejs.org/api/esm.html). I learned about the `"type": "module"` setting in `package.json`.

**Fix I applied:** Confirmed that `package.json` contained the module configuration and kept import syntax:

```json
{
  "name": "northstar-inventory",
  "version": "1.0.0",
  "type": "commonjs"
}
```

**Why it worked:** Node.js supports two module systems: CommonJS (`require`) and ES Modules (`import`). The `type` setting determines how `.js` files are interpreted. The project should use a consistent setting: use `"type": "module"` with `import`, or `"type": "commonjs"` with `require`.

### Blocker 3 — Day 1 · 1:00 PM

**What I was trying to do:** Test the `POST /api/stock/update` endpoint from PowerShell to update a stock item.

**Error / symptom:**

```json
{ "error": "Missing required fields" }
```

This occurred even though `itemId` and `quantity` were present in the request body. After adding `console.log(req.body)`, I saw `undefined` in the terminal.

**First thing I tried:** Re-checked the body, confirmed it was valid JSON, and ran the request again. The same error occurred.

**Resource that helped:** [Vercel Body Parsing documentation](https://vercel.com/docs/functions/runtimes/node-js#body-parsing) and Stack Overflow discussions about `vercel req.body undefined`.

**Fix I applied:** Added `-ContentType "application/json"` to the PowerShell command:

```powershell
Invoke-WebRequest -UseBasicParsing -Method POST `
  "http://localhost:3000/api/stock/update" `
  -ContentType "application/json" `
  -Body '{"itemId":"A002","quantity":10}'
```

**Why it worked:** The `Content-Type: application/json` header tells the framework how to parse the request body. Without it, `req.body` may remain undefined.

### Blocker 4 — Day 1 · 1:40 PM

**What I was trying to do:** Confirm that after posting to `/api/stock/update`, a GET request to `/api/stock?itemId=A002` would return the updated quantity.

**Error / symptom:** There was no error, but the GET request returned `quantity: 0` even after a successful POST set it to 10.

**First thing I tried:** Repeated the POST, waited several seconds, and ran the GET again. The quantity was still 0. I checked the update logic, which appeared correct.

**Resource that helped:** [Vercel Functions documentation](https://vercel.com/docs/functions) and a Cloudflare article about why serverless functions are stateless.

**What I discovered:** Each Vercel serverless function, such as `api/stock.js` and `api/stock/update.js`, runs in a separate process with its own memory. When `/update` modifies the inventory object, it modifies its own local copy. The `/stock` function holds a different copy and is unaffected. This is expected behaviour, not a bug.

**How this is solved in production:** I used an external database, Supabase. All functions read from and write to the same database rather than relying on in-memory objects.

**Why this matters for Day 4:** When the team switches to a webhook push model, the webhook handler will write incoming stock updates to a shared database, and the query endpoint will read from that same database. This architectural requirement follows directly from serverless statelessness.

### Blocker 5 — Day 1 · 2:30 PM

**What I was trying to do:** Test the endpoint using PowerShell's `Invoke-WebRequest` after `vercel dev` started successfully.

**Error / symptom:** PowerShell displayed this warning before returning the response:

```text
Security Warning: Script Execution Risk
Invoke-WebRequest parses the content of the web page.
Script code in the web page might be run when the page is parsed.
RECOMMENDED ACTION:
Use the -UseBasicParsing switch to avoid script code execution.
Do you want to continue? [Y] Yes [N] No (default is "N"):
```

I initially pressed `N`, and the command returned nothing. I thought the server had an error.

**First thing I tried:** Pressed `N`, received no response, and restarted `vercel dev` to check whether it was still running.

**Resource that helped:** [PowerShell Invoke-WebRequest documentation](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-webrequest). I learned that `-UseBasicParsing` bypasses HTML parsing and is suitable for API requests.

**Fix I applied:** Added `-UseBasicParsing` to every subsequent command:

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/stock?itemId=A001"
```

**Why it worked:** PowerShell's `Invoke-WebRequest` attempts to parse responses as HTML by default. For JSON API responses, this is unnecessary. `-UseBasicParsing` skips HTML parsing, suppresses the warning, and returns the raw response.

### Blocker 6 — Day 2 · 10:30 AM

**What I was trying to do:** Access `/api/stock/all` in the browser after moving files around.

**Error / symptom:**

```text
404: NOT_FOUND
Code: NOT_FOUND
```

**First thing I tried:** Checked the URL for typos and restarted `vercel dev`. The route still returned 404.

**Resource that helped:** [Vercel file-based routing documentation](https://vercel.com/docs/functions/runtimes/node-js#routing).

**Fix I applied:** Discovered that the file was at `api/all.js` instead of `api/stock/all.js` and moved it to the correct path.

**Why it worked:** In Vercel, the URL route is derived directly from the file path inside the `api/` directory. `api/all.js` maps to `/api/all`, not `/api/stock/all`. Moving the file to `api/stock/all.js` made it accessible at the correct URL.

## Section 6 — End of Day 2 Reflection

### Concept that surprised me most

Serverless functions are completely stateless: memory does not persist between calls or between different functions. This was the opposite of what I expected from Express, where a single server process stays alive and shared variables are accessible throughout the application.

### Biggest mistake I made

I assumed PowerShell's `Invoke-WebRequest` would work like `curl` without additional flags. The security prompt that appeared when I pressed `N` silently stopped the request, making it look as though the server was not running.

### How serverless functions differ from a regular Node.js server

A regular server is one long-running process: it starts once and handles many requests. A serverless function starts for a request, runs, and exits. There is no guaranteed shared memory between invocations. This makes functions easy to deploy and scale, but application state must be managed externally.

