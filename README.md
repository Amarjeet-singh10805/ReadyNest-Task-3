# InstaForge — Full-Stack Instagram Clone

React + Vite + Tailwind frontend, Node/Express backend, MySQL via Prisma ORM, JWT auth (HTTP-only cookies), Cloudinary image storage, Socket.IO real-time features, Zustand state management.

## Features
Auth (register/login/logout, JWT cookies, edit profile), posts (create/edit/delete, Cloudinary upload), feed (infinite scroll, following-based), likes (real-time), comments (real-time), save/bookmark, follow/unfollow (real-time follower counts), user search, notifications (real-time, likes/comments/follows), dark mode, fully responsive UI.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Zustand, TanStack Query, Socket.IO Client, React Hook Form, Zod
- **Backend:** Node.js, Express, Socket.IO, JWT, Bcrypt, Multer, Helmet, express-rate-limit
- **Database:** MySQL + Prisma ORM
- **Storage:** Cloudinary

## Important: Database hosting
Render does not offer a managed MySQL service (only PostgreSQL). This project uses MySQL, so host the database on an external provider and point `DATABASE_URL` at it. Good free/cheap options:
- [PlanetScale](https://planetscale.com)
- [Railway](https://railway.app)
- [Aiven](https://aiven.io)

The Express API itself still deploys on Render as a normal Web Service — only the database lives elsewhere.

---

## 1. Local Setup

### Prerequisites
- Node.js 18+
- A MySQL database (local MySQL, or a free instance from PlanetScale/Railway/Aiven)
- A free [Cloudinary](https://cloudinary.com) account

### Backend

```bash
cd server
cp .env.example .env
# fill in DATABASE_URL, JWT_SECRET, CLOUDINARY_* in .env
npm install
npx prisma migrate dev --name init
npm run seed        # optional: creates demo users/posts
npm run dev          # starts on http://localhost:5000
```

Seeded demo login: `alice@example.com` / `password123`

### Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev          # starts on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, and Socket.IO connects directly using `VITE_SOCKET_URL`.

---

## 2. Deploying to Render

This repo includes a `render.yaml` (Render "Blueprint") that defines two services: the API and the static frontend. From the Render dashboard choose **New > Blueprint** and point it at this repo, or create the services manually as below.

### Step 1 — Provision MySQL externally
Create a database on PlanetScale/Railway/Aiven and copy its connection string. It should look like:
```
mysql://user:password@host:3306/dbname?sslaccept=strict
```

### Step 2 — Backend (Render Web Service)
- Root directory: `server`
- Build command: `npm install && npm run build` (this runs `prisma generate && prisma migrate deploy`)
- Start command: `npm start`
- Environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL` (your frontend URL), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- After first deploy, you can run `npm run seed` from the Render Shell to add demo data.

### Step 3 — Frontend (Render Static Site)
- Root directory: `client`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variables: `VITE_API_URL=https://<your-backend>.onrender.com/api`, `VITE_SOCKET_URL=https://<your-backend>.onrender.com`
- Add a rewrite rule `/* → /index.html` so client-side routing works.

### Step 4 — Update CORS
Set the backend's `CLIENT_URL` env var to the deployed frontend URL so cookies and Socket.IO CORS work correctly.

### Single-service alternative
If you'd rather serve the frontend from the same Express server instead of a separate static site, set `SERVE_CLIENT=true` on the backend, build the client (`cd client && npm run build`), and the server will serve `client/dist` and handle SPA routing automatically.

---

## 3. Project Structure

```
server/
  controllers/   # route handlers
  routes/        # express routers
  middleware/    # auth, upload, error handling
  config/        # prisma client, cloudinary
  socket/        # socket.io server + online user tracking
  prisma/        # schema.prisma, seed.js
  server.js

client/
  src/
    components/  # PostCard, CommentSection, skeletons
    pages/       # route-level pages
    layouts/     # MainLayout (sidebar/bottom nav)
    store/       # zustand stores (auth, theme, notifications)
    services/    # axios instance, socket.io client
    routes/      # ProtectedRoute / PublicOnlyRoute
```

## 4. Security notes
JWT is stored in an HTTP-only, SameSite cookie (never localStorage). Passwords are hashed with bcrypt. All write endpoints are behind `protectRoute` middleware. Input is validated with Zod schemas server-side. Helmet sets security headers, and rate limiting is applied globally and more strictly on `/api/auth/login` and `/api/auth/register`. Prisma's parameterized queries prevent SQL injection.
