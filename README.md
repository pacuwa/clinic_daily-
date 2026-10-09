# Clinic Daily Stock Inventory System

A real web application for clinic inventory management with role-based access for admin and staff.

## Features

- Admin login and staff login
- Inventory management
- Stock in and stock out tracking
- Daily sales and inventory reporting
- Role-based access control
- SQLite database for lightweight local deployment

## Recommended stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Database: SQLite
- Authentication: JWT

## App architecture

- `backend/` — REST API and business logic
- `frontend/` — pages and UI scripts
- `database/` — schema and seed data
- `docs/` — usage and API docs

## Default users

- Admin: admin@clinic.com / admin123
- Staff: staff@clinic.com / staff123

## Run locally

1. Install dependencies:
   npm install
2. Copy environment file:
   cp .env.example .env
3. Start the server:
   npm run dev
4. Open in browser:
   http://localhost:3000

## Project status

This scaffold establishes the initial architecture and starter code for development.
