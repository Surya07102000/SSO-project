## SSO Project (Monorepo)

This repository contains two Node.js services:

- `central-app`: Centralized authentication and application management (SSO, users, tokens)
- `application-1`: Example product service secured by the central app

Both apps are Express servers using PostgreSQL via Sequelize and expose Swagger UI.

### Prerequisites
- Node.js 18+
- PostgreSQL instance accessible to both services

### Getting Started
1. Install dependencies for both apps:
```bash
cd central-app && npm install
cd ../application-1 && npm install
```

2. Configure environment variables. Create `.env` in each app directory. Example:
```bash
# Common
NODE_ENV=development
PORT=3000              # central-app (use 3001 in application-1)

# Database
DB_HOST=localhost
DB_DIALECT=postgres
DB_NAME=sso_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=5432
DB_LOGGING=false
DB_SYNC=yes            # yes to sync models on boot (dev only)

# Auth (central-app issues tokens; application-1 validates)
JWT_SECRET=replace-with-strong-secret
JWT_SECRET_REFRESH=replace-with-strong-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```
- For `application-1`, set `PORT=3001` and use the same DB/auth values as appropriate for your environment.
- Consider committing `.env.example` with non-sensitive placeholders.

### Running
- central-app:
```bash
cd central-app
npm run dev   # or: npm start
```
  - Serves on `http://localhost:3000`
  - Swagger UI: `http://localhost:3000/api-docs`

- application-1:
```bash
cd application-1
npm run dev   # or: npm start
```
  - Serves on `http://localhost:3001`
  - Swagger UI: `http://localhost:3001/api-docs`

Both apps initialize the database connection on server start.

### Scripts
Common scripts available in each app:
- `npm start`: run server
- `npm run dev`: run with nodemon
- `npm test`: run Jest tests
- `npm run test:watch`: watch mode
- `npm run test:coverage`: coverage
- `npm run test:ci`: CI-friendly run

### API Overview
- central-app routes are mounted under `/api/v1`:
  - `/api/v1/auth/login`, `/register`, `/change-password`, `/forgot-password`, `/reset-password`, `/refresh-token`, `/logout`, `/logout-all`, `/sso-login`
- application-1 routes are mounted under `/api/v1`:
  - `/api/v1/product` (GET, POST), `/api/v1/product/{id}` (GET, PATCH, DELETE)

Refer to `central-app/src/swagger.json` and `application-1/src/swagger.json` for schemas and details.

### Project Structure
```
sso-project/
  central-app/
    src/
      app.js, index.js, routes/, controllers/, services/, model/, middlewares/, config/
      swagger.json
  application-1/
    src/
      app.js, index.js, routes/, controllers/, services/, model/, middlewares/, config/
      swagger.json
```

### Notes
- CORS is configured to allow all origins by default; adjust in `src/app.js` for production.
- In production with PostgreSQL over SSL, SSL is enabled when `NODE_ENV=production`.
- Set `DB_SYNC=yes` only in development; prefer migrations in production.

### Testing
From each app directory:
```bash
npm test
```

### License
ISC
