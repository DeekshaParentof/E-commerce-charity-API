# Charity Shop: MERN E-commerce for Good Causes

A full-stack e-commerce app where every product belongs to a charity campaign, and every purchase supports that cause.

- **Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT auth, Cloudinary image uploads, optional email (Nodemailer) and SMS (Twilio) order notifications
- **Frontend:** React 19, Vite, React Router 7, Tailwind CSS, Axios

## Features

**Shoppers**
- Register and log in with an email or a mobile number (JWT, auto-logout when the session expires)
- Browse products, with search, category filters and sorting
- Product detail pages with stock and discount information
- Cart that persists in the browser, with quantity limits based on stock
- Address book: add, edit and delete delivery addresses
- Checkout: choose a delivery address, review items and place the order
- Order history and order detail, including the delivery address used
- Responsive layout from mobile to desktop

**Admins (API only)**
- Admins and super admins create categories, charities and products through the API, with image uploads to Cloudinary
- Admins manage only their own records; super admins can manage everything

## Project structure

```
.
├── backend/                 Express + MongoDB API
│   ├── controllers/         Route handlers
│   ├── middlewares/         Auth, file upload, request validation
│   ├── models/              Mongoose schemas
│   ├── routes/              Express routers (mounted under /api/v1)
│   ├── scripts/seed.js      Creates a super admin + demo data
│   ├── utils/               Cloudinary helper, email templates
│   └── index.js             App entry point
└── frontend/                React + Vite app
    └── src/
        ├── components/      Navbar, ProductCard, AddressForm, ...
        ├── context/         Auth, Cart and Toast providers
        ├── hooks/           useFetch
        ├── pages/           Route pages
        ├── services/        Axios API clients
        └── utils/           Formatting helpers
```

## Getting started (local)

### Prerequisites
- Node.js 18 or newer
- MongoDB, either installed locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in the values (see below)
npm run seed              # optional: super admin + demo categories, charity and products
                          # (re-running it refreshes demo images/text without touching stock or prices)
npm run dev               # http://localhost:8080
```

Check that it's running: `GET http://localhost:8080/api/v1/health` should return `{"status":"ok","db":"connected"}`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:8080/api/v1
npm run dev               # http://localhost:5173
```

### Environment variables

**backend/.env**

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | no | API port (default `8080`) |
| `MONGO_URL` | **yes** | MongoDB connection string |
| `JWT_SECRETE_KEY` | **yes** | Secret used to sign JWTs. Use a long random string. |
| `JWT_EXPIRES_IN` | no | Token lifetime, e.g. `1h` or `1d` (default `1d`) |
| `CLIENT_URL` | no | Comma-separated frontend origins allowed by CORS (default `http://localhost:5173`) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | for admin uploads | Needed to create categories, charities and products with images |
| `EMAIL_USER`, `EMAIL_PASS` | no | Gmail address and [App Password](https://support.google.com/accounts/answer/185833) for order emails |
| `TEST_RECIPIENT_EMAIL` | no | If set, all order emails go to this address instead of the customer and charity |
| `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TEST_RECIPIENT_PHONE` | no | Order confirmation SMS. Only sent when all four are set. |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | no | Credentials for the super admin created by `npm run seed` |
| `DEMO_IMAGE_BASE_URL` | no | Base URL for seeded demo images (default `/demo`, i.e. served by the frontend from `frontend/public/demo`) |

Email and SMS are optional. If they aren't configured, or if sending fails, the order is still placed and the error is logged on the server.

**frontend/.env**

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | API base URL, including `/api/v1` |

### Admin accounts

Public registration always creates a `user` account, so nobody can make themselves an admin. To get an admin:
- run `npm run seed`, which creates a `super_admin` using `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, or
- register normally, then change that user's `role` to `admin` or `super_admin` in MongoDB.

## API reference

Base URL: `/api/v1`. 🔒 means the request needs `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/users/register` | Register `{ name, email, mobile, password }` |
| POST | `/users/login` | Log in `{ userId (email or mobile), password }` → `{ token, user }` |
| GET 🔒 | `/users/me` | Current user's profile |
| GET | `/product` | List products. Optional query: `status`, `category`, `charity`, `search` |
| GET | `/product/:id` | Product details (with charity and category) |
| GET | `/product/category/:id` | Products in a category |
| GET | `/product/charity/:id` | Products of a charity |
| POST 🔒 | `/product` | Create a product (admin; multipart with `image`) |
| PUT / PATCH 🔒 | `/product/:id` | Update a product, or only its status (admin) |
| GET 🔒 | `/product/admin/charity/:id` | Admin view of a charity's products |
| GET | `/category` | List categories |
| POST 🔒 | `/category` | Create a category (admin; multipart with `image`) |
| GET 🔒 / PATCH 🔒 | `/category/admin`, `/category/:id` | Admin list / update |
| GET | `/charity`, `/charity/:id` | List charities / get one |
| POST 🔒 | `/charity` | Create a charity (admin; multipart with `banner`) |
| GET 🔒 / PUT 🔒 | `/charity/admin`, `/charity/admin/:id`, `/charity/:id` | Admin list / get / update |
| GET 🔒 | `/address` | List the user's addresses |
| POST 🔒 | `/address` | Add `{ location, city, state, pincode, country? }` |
| PUT 🔒 / DELETE 🔒 | `/address/:id` | Update or delete your own address |
| POST 🔒 | `/order` | Place an order `{ product_id, charity_id, quantity, address_id? }` |
| GET 🔒 | `/order` | Your order history |
| GET 🔒 | `/order/:id` | One of your orders |
| GET 🔒 | `/order/charity/:charity_id` | Orders for a charity (the charity's admin, or a super admin) |
| GET | `/health` | Health check |

### How ordering works
- The API creates **one order per product**. The cart is stored in the browser, and checkout places one order for each item in it.
- A product can only be ordered when its `status` is `active`, its charity's `status` is `live`, and there is enough stock.
- `discount` is a **percentage**. The server calculates the price (`price × (100 − discount) / 100 × quantity`) and reduces stock in a single atomic update. When stock reaches 0, the product is marked `sold`.
- Each order stores a copy of the delivery address, so editing or deleting an address later doesn't change past orders.
- There is no payment gateway. The UI says payment is collected on delivery.

## Demo images

The seeded products use public-domain photos stored in `frontend/public/demo/`, so the frontend serves them itself (credits are in `frontend/public/demo/CREDITS.md`). Products that admins create through the API upload their images to Cloudinary instead.

## Deployment

The recommended setup uses free tiers: **MongoDB Atlas** for the database, **Render** for the API and **Vercel** for the frontend. Any Node host or static host works the same way.

### 1. Database: MongoDB Atlas
1. Create a free cluster and a database user.
2. Under **Network Access**, allow `0.0.0.0/0`, or your host's outbound IPs.
3. Copy the connection string, for example `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/charity-shop`.

### 2. API: Render
1. Go to **New → Web Service** and connect this repo.
2. Set **Root Directory** to `backend`, **Build Command** to `npm install` and **Start Command** to `npm start`.
3. Add the environment variables from the table above: at minimum `MONGO_URL` and `JWT_SECRETE_KEY`, plus `CLIENT_URL` (set it after step 3). Render sets `PORT` for you.
4. Deploy, then open `https://<your-api>.onrender.com/api/v1/health`.
5. Optional: run the seed once from Render's **Shell** tab with `npm run seed`.

> Free Render services go to sleep when idle, so the first request after a while can take about 30 seconds.

### 3. Frontend: Vercel
1. Go to **Add New → Project** and import this repo.
2. Set **Root Directory** to `frontend` (Vite is detected automatically: build `npm run build`, output `dist`).
3. Add the environment variable `VITE_API_URL=https://<your-api>.onrender.com/api/v1`.
4. Deploy. `frontend/vercel.json` rewrites every route to `index.html`, so deep links like `/orders/123` work.

**Netlify** works too: set the base directory to `frontend`, build with `npm run build` and publish `dist`. The rewrite rule is in `public/_redirects`.

### 4. Connect them
Set `CLIENT_URL` on the API to your frontend URL, for example `https://charity-shop.vercel.app`, and redeploy the API. Separate several origins with commas. Vite reads `VITE_*` variables when it builds, so **redeploy the frontend** whenever you change `VITE_API_URL`.

## Scripts

| Location | Command | Description |
| --- | --- | --- |
| backend | `npm run dev` | Start the API with nodemon |
| backend | `npm start` | Start the API (production) |
| backend | `npm run seed` | Create a super admin and demo data (safe to re-run) |
| frontend | `npm run dev` | Start the Vite dev server |
| frontend | `npm run build` | Production build to `dist/` |
| frontend | `npm run preview` | Preview the production build |
| frontend | `npm run lint` | Run ESLint |
