# OMW Backend

Express backend scaffold for the marketplace platform. This setup is structured around the major flows from the backend scope document:

- Authentication and customer accounts
- Vendor onboarding and store management
- Product catalog management
- Cart and checkout
- Order lifecycle tracking
- Offline purchase sync
- Rewards and loyalty
- Admin dashboard and homepage content
- Analytics and notifications

## Run

1. Copy `.env.example` to `.env`
2. Install dependencies:

```bash
npm install
```

3. Start the API:

```bash
npm run dev
```

The server runs on `http://localhost:5000` by default.

## PostgreSQL and Prisma

1. Install PostgreSQL on your machine and make sure it is running on port `5432`
2. Open `backend/.env` and replace `your_pg_password` with your actual postgres password
3. Create a database named `omw_marketplace`
4. Generate the Prisma client:

```bash
npm run prisma:generate
```

5. Create the database tables from the Prisma schema:

```bash
npm run prisma:migrate -- --name init
```

6. Seed sample data if you want starter records:

```bash
npm run prisma:seed
```

7. Open Prisma Studio if you want a browser-based data viewer:

```bash
npm run prisma:studio
```

## pgAdmin Setup

1. Install PostgreSQL with pgAdmin 4 included
2. Open pgAdmin 4
3. Right-click `Servers` and choose `Register` then `Server`
4. In `General`, give it a name like `Local PostgreSQL`
5. In `Connection`, use:
   Host: `localhost`
   Port: `5432`
   Username: `postgres`
   Password: your postgres password
6. Save the server
7. Right-click `Databases` under that server and create a new database named `omw_marketplace`
8. After that, run the Prisma commands above from the `backend` folder

## Main Endpoints

- `GET /api/health`
- `GET /api/products`
- `GET /api/vendors`
- `GET /api/orders`
- `GET /api/offline-purchases`
- `GET /api/rewards/summary`
- `GET /api/homepage`
- `GET /api/admin/dashboard`
- `GET /api/analytics/overview`

This backend still uses in-memory controllers right now, but Prisma and PostgreSQL are now prepared so the next step is replacing the mock data layer with Prisma queries.
