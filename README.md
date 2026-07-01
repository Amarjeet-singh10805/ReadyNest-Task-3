# InstaForge — Full-Stack Instagram Clone

React + Vite + Tailwind frontend, Node/Express backend, MySQL via Prisma ORM, JWT auth (HTTP-only cookies), Cloudinary image storage, Socket.IO real-time features, Zustand state management.

## Features
Auth (register/login/logout, JWT cookies, edit profile), posts (create/edit/delete, Cloudinary upload), feed (infinite scroll, following-based), likes (real-time), comments (real-time), save/bookmark, follow/unfollow (real-time follower counts), user search, notifications (real-time, likes/comments/follows), dark mode, fully responsive UI.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Zustand, TanStack Query, Socket.IO Client, React Hook Form, Zod
- **Backend:** Node.js, Express, Socket.IO, JWT, Bcrypt, Multer, Helmet, express-rate-limit
- **Database:** MySQL + Prisma ORM

## Project Structure

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
