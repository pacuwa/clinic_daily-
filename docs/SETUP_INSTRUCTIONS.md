# Setup Instructions

## Prerequisites

- Node.js v14 or higher
- npm v6 or higher
- SQLite3

## Installation Steps

### 1. Clone the repository

```bash
git clone https://github.com/pacuwa/clinic_daily-.git
cd clinic_daily-
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

```bash
cp .env.example .env
```

Update `.env` with your configuration if needed.

### 4. Initialize the database

```bash
npm run seed
```

This will:
- Create all database tables
- Create default users:
  - Admin: `admin@clinic.com` / `admin123`
  - Staff: `staff@clinic.com` / `staff123`
- Insert sample inventory items

### 5. Start the server

```bash
npm run dev
```

The server will start on http://localhost:3000

### 6. Access the application

- Open your browser and go to: http://localhost:3000
- Login with the default credentials

## Project Structure

```
backend/
├── config/          # Configuration files (db, auth)
├── controllers/     # Business logic handlers
├── middleware/      # Auth, validation middleware
├── routes/          # API route definitions
├── utils/           # Utility functions (JWT tokens)
└── server.js        # Main server file

frontend/
├── css/            # Stylesheets
├── js/             # Frontend scripts
└── pages/          # HTML pages

database/
├── schema.sql      # Database schema
├── seed-data.js    # Data seeding script
└── clinic_inventory.db  # SQLite database (created after seed)

docs/               # Documentation files
```

## Default Credentials

**Admin User:**
- Email: `admin@clinic.com`
- Password: `admin123`

**Staff User:**
- Email: `staff@clinic.com`
- Password: `staff123`

⚠️ **Important**: Change these credentials after your first login!

## Key Features

### Admin Features
- Login with JWT authentication
- View all inventory items
- Add new items to inventory
- Record stock in (purchase receipts)
- View stock in history
- View daily, weekly, monthly reports
- View current stock levels

### Staff Features
- Login with JWT authentication
- View current inventory
- Record stock out (sales)
- View stock out history
- View daily reports

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires token)

### Inventory
- `GET /api/inventory` - List all items
- `GET /api/inventory/:id` - Get item details
- `POST /api/inventory` - Add new item (Admin only)
- `PUT /api/inventory/:id` - Update item (Admin only)

### Stock Management
- `POST /api/stock-in` - Record stock in (Admin only)
- `GET /api/stock-in` - View stock in history
- `POST /api/stock-out` - Record stock out (Authenticated)
- `GET /api/stock-out` - View stock out history

### Reports
- `GET /api/reports/daily` - Daily sales report
- `GET /api/reports/weekly` - Weekly sales report
- `GET /api/reports/monthly` - Monthly sales report
- `GET /api/reports/stock-levels` - Current stock status

## Troubleshooting

### Database already exists error
If you get an error about database already existing, delete the `clinic_inventory.db` file and run `npm run seed` again.

### Port already in use
If port 3000 is already in use, change the PORT in `.env` file.

### Database connection error
Make sure the `database` folder exists and has write permissions.

## Next Steps

1. Change default credentials
2. Add more staff users
3. Start adding inventory items
4. Configure your clinic details
5. Generate initial inventory reports

## Support

For issues or questions, please open an issue on GitHub.
