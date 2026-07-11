# 🏪 Local Shops Finder

A full-stack web app that puts local shops — grocery stores, medical shops, fertilizer depots, and general
stores — on an interactive map, so nearby customers can find them and see what's in stock.

- **Frontend:** React (Vite) + React Router + Leaflet (OpenStreetMap tiles)
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Auth:** Email + password with OTP email verification (registration & shop deletion)
- **Email delivery:** [Brevo](https://www.brevo.com/) (formerly Sendinblue) transactional email API
- **Image storage:** [Cloudinary](https://cloudinary.com/) (product photo uploads)
- **Maps:** OpenStreetMap + Leaflet (no API key or billing required) — shown on the **Home** map and the
  shop-location picker used when listing a shop

---

## ✨ Features

- **Map home page** — every listed shop shown as a pin on an OpenStreetMap/Leaflet map, plus a card grid.
- **Register & login** — Gmail (or any email) + password. Registration requires OTP email verification before
  the account is active.
- **List your shop** — shop name, contact, optional category (medicine / fertilizer / grocery / general /
  other), a **manual, complete address** (address line, city, state, and pincode — all required), and location
  set via **"use my current location"** (GPS) or by **clicking on the map** to drop a pin.
- **Manage products** — add products with name, quantity, and a photo (uploaded straight to **Cloudinary**).
  Products are displayed **sorted alphabetically** in a responsive table (photo above/beside name and quantity).
  Owners can **update** quantity, name, or photo of any existing product (adding a product with the same name
  updates it instead of duplicating it).
- **In-shop search** — a search box + button on each shop page filters that shop's own product list.
- **Manage shop page** — shows the shop's full address and contact details (no map here — just clean, readable
  shop info).
- **Global search page** (no map on this page — pure list-based results), with two modes:
  1. **By product name** — shows every shop that stocks a matching product, in a table with the product photo,
     quantity, shop owner, contact, full address, distance from the user (if you share your location), and a
     **View products** button.
  2. **By location + category** — share your current location, optionally filter by category, and see all
     shops within a chosen radius (default 10 km), in the same result table.
- **Delete shop** — protected by an OTP sent to the owner's email before the deletion is confirmed.
- **About page** explaining the project.
- Fully responsive UI — tables collapse into stacked cards on small screens, mobile nav menu, touch-friendly
  buttons.

---

## 📁 Project structure

```
.
├── backend/               Express API server
│   ├── config/db.js        MongoDB connection
│   ├── config/cloudinary.js Cloudinary SDK configuration
│   ├── middleware/         auth (JWT) & multer (in-memory) upload middleware
│   ├── models/             User, Shop (+ embedded Product, structured address) Mongoose schemas
│   ├── routes/              auth, shops, search routes
│   ├── utils/               Brevo email sender, OTP generator, haversine distance
│   └── server.js             app entry point
│
└── frontend/              React (Vite) SPA
    └── src/
        ├── api/axios.js           axios instance (adds JWT header)
        ├── context/AuthContext.jsx
        ├── components/           Navbar, MapView, LocationPicker, ProductTable,
        │                         ShopResultRow, OtpModal, PrivateRoute
        ├── utils/format.js       address formatting helper
        └── pages/                Home, Login, Register, VerifyOtp, ListShop,
                                   ShopDetail, Search, Dashboard, About
```

---

## 🔧 Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A MongoDB database — either:
  - a local instance ([install guide](https://www.mongodb.com/docs/manual/installation/)), or
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (recommended if you don't want to install
    MongoDB locally)
- A free [Brevo](https://www.brevo.com/) account (for sending OTP emails)

---

## 1️⃣ Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb://127.0.0.1:27017/local_shops
# or an Atlas URI: mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/local_shops

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d

BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=no-reply@yourdomain.com
SENDER_NAME=Local Shops Finder

OTP_EXPIRES_MINUTES=10

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Getting Cloudinary credentials

1. Create a free account at [cloudinary.com](https://cloudinary.com/).
2. On your [dashboard](https://console.cloudinary.com/), copy the **Cloud name**, **API Key**, and **API
   Secret** into the matching `.env` variables above.
3. That's it — no bucket or upload preset setup needed; the backend uploads photos directly using the
   `cloudinary` SDK into a `local-shops-finder/products` folder.

### Getting a Brevo API key

1. Create a free account at [brevo.com](https://www.brevo.com/).
2. Go to **Settings → SMTP & API → API Keys** (or visit
   [app.brevo.com/settings/keys/api](https://app.brevo.com/settings/keys/api)).
3. Click **Generate a new API key**, copy it into `BREVO_API_KEY`.
4. Go to **Senders** and verify a sender email/domain — use that address as `SENDER_EMAIL`. Brevo requires the
   sender address to be verified before it will deliver mail on your behalf.

Start the server:

```bash
npm run dev     # with nodemon (auto-restart)
# or
npm start
```

The API will run at `http://localhost:5000`. Visit `http://localhost:5000/api/health` to confirm it's up.

---

## 2️⃣ Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env` if your backend runs somewhere other than `http://localhost:5000`:

```env
VITE_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:5173`.

To build for production:

```bash
npm run build     # outputs to frontend/dist
npm run preview   # preview the production build locally
```

---

## 🗺️ How the map works

- Map tiles come from the free OpenStreetMap tile server (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`)
  — no API key needed. For production traffic beyond light personal use, consider a dedicated tile provider
  (e.g. MapTiler, Stadia Maps, or your own tile server) per
  [OSM's tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
- The map is used on the **Home** page (all shops) and on the **List your shop** page (to pick coordinates via
  current location or a click). The **Search** page and the shop **manage** page are map-free by design — they
  show shop details as plain, readable lists/tables with the full address instead.
- Shop locations are stored as GeoJSON `Point`s with a MongoDB `2dsphere` index, so "shops near me" queries use
  MongoDB's native `$nearSphere` geospatial query. The manual address (line, city, state, pincode) is stored
  separately and is what's shown to users; the coordinates are only used for map pins and distance/radius
  search.
- Distances shown in search results are calculated with the Haversine formula on the backend.

---

## 🔐 How OTP verification works

- **Registration:** on sign-up, a 6-digit OTP is emailed via Brevo and the account stays `isVerified: false`
  until the correct code is entered on the verification screen. Codes expire after `OTP_EXPIRES_MINUTES`
  minutes (10 by default) and can be resent.
- **Shop deletion:** clicking "Delete shop" requests a fresh OTP to the owner's registered email; the shop is
  only removed once that code is confirmed, preventing accidental or unauthorized deletion.

---

## 📡 API overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account, sends OTP |
| POST | `/api/auth/verify-otp` | – | Verify email, returns JWT |
| POST | `/api/auth/resend-otp` | – | Resend a new OTP |
| POST | `/api/auth/login` | – | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/shops` | – | All shops (for map/listing) |
| GET | `/api/shops/mine` | ✅ | Shops owned by current user |
| GET | `/api/shops/:id` | – | Shop detail, products sorted A–Z |
| POST | `/api/shops` | ✅ | Create a shop (body: `name, contact, category, addressLine, city, state, pincode, lat, lng`) |
| PUT | `/api/shops/:id` | ✅ (owner) | Edit shop info (same address fields, all optional on update) |
| POST | `/api/shops/:id/products` | ✅ (owner) | Add/update a product (multipart, field `photo`) |
| PUT | `/api/shops/:id/products/:productId` | ✅ (owner) | Update a specific product |
| DELETE | `/api/shops/:id/products/:productId` | ✅ (owner) | Remove a product |
| POST | `/api/shops/:id/request-delete-otp` | ✅ (owner) | Send OTP before deleting shop |
| DELETE | `/api/shops/:id` | ✅ (owner) | Delete shop (body: `{ otp }`) |
| GET | `/api/search/product?name=&lat=&lng=` | – | Shops stocking a matching product |
| GET | `/api/search/location?lat=&lng=&category=&radius=` | – | Shops within radius, optional category |

---

## 🛠️ Notes & possible next steps

- Product photos are uploaded directly to Cloudinary from an in-memory buffer (no local disk writes), so
  uploads survive redeploys and restarts out of the box.
- The JWT is stored in `localStorage` on the frontend for simplicity; consider httpOnly cookies for stronger
  security in production.
- Category list currently is: `medicine`, `fertilizer`, `grocery`, `general`, `other` — extend the `enum` in
  `backend/models/Shop.js` and the `<select>` options in the frontend to add more.
- Address is stored as a structured object (`line`, `city`, `state`, `pincode`) rather than a free-text string,
  making it easy to validate, search, or format consistently across pages.
