# BurgerLab catalog connection test

The API runs locally on Node.js 24 and on AWS Lambda behind API Gateway. It reads the existing catalog using TLS. The menu test panel displays one database product independently of the sample storefront.

## Local setup

From the repository root, install dependencies, download the public RDS CA bundle, and create local configuration.

```powershell
npm ci
npm run download-ca --workspace backend
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Edit `backend/.env` locally with the endpoint, port, database, and dedicated catalog reader credentials. Quote values containing `#`, spaces, or dotenv syntax. Keep `DB_NAME=TheBurgerLab` and `DB_SSL_CA_PATH=certs/global-bundle.pem`. The database security group must allow this computer's IP or a configured private network path.

The frontend example enables the panel and uses `http://localhost:3001`. Only public configuration belongs in frontend variables. Real `.env` files are ignored. Verify with `git check-ignore backend/.env frontend/.env`.

Run `npm run dev:backend` and `npm run dev` in separate terminals. Open `http://localhost:5173/#/menu`. If Vite selects a different port, update backend `ALLOWED_ORIGINS` and restart the backend. Restart Vite after changing frontend variables.

## API contract

`GET /api/health` returns HTTP 200 with `{ "status": "ok" }` without querying MySQL. `GET /api/catalog/connection-test` performs a fresh read and returns this shape.

```json
{
  "status": "connected",
  "catalogKey": "public_catalog",
  "catalogVersion": "1",
  "empty": false,
  "product": {
    "menuItemId": 101,
    "name": "Classic Cheeseburger",
    "variantId": 201,
    "variantName": "Standard",
    "price": "6.49"
  },
  "requestId": "server-generated-request-id"
}
```

Actual values come from MySQL. Selection uses active products and available variants, ordered by product ID, variant display order, and variant ID. Prices and versions are strings. A missing version yields `null`. An empty eligible catalog yields `empty: true` and `product: null` with a connected status.

Failures return HTTP 503 with a generic message and request ID. Logs contain an allowlisted error category. Responses use `Cache-Control: no-store`. CORS accepts configured origins. These read-only endpoints are public, and CORS does not authenticate callers.

## Verification and deployment

```powershell
npm run test:backend
npm run build:backend
npm run lint
npm run build
npm run package:backend
```

Packaging creates `backend/dist/burgerlab-api.zip` with the handler and public CA bundle. Download the CA bundle first. Follow [AWS console setup](../docs/aws-api-setup.md) to deploy and verify RDS access.
