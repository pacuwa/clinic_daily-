# Clinic Daily Stock Inventory System

A web-based stock inventory management system designed for clinics/pharmacies with role-based access for admin and staff.

## Features

### Admin Features
- Login with secure authentication
- Enter and manage stock inventory
- View all stock transactions
- Generate daily/weekly/monthly reports
- Track stock in and stock out
- User management

### Staff Features
- Login with credentials
- View available stock levels
- Record stock sales (stock out)
- View daily sales activity
- Generate personal sales reports

## System Architecture

```
clinic_daily/
├── frontend/                 # Vue.js/React dashboard
├── backend/                  # Node.js/Flask API
├── database/                 # SQLite database
├── reports/                  # Report generation
└── docs/                     # Documentation
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (with optional Vue.js/React)
- **Backend**: Node.js with Express OR Python with Flask
- **Database**: SQLite (lightweight, no setup required)
- **Reports**: Chart.js for visualizations, PDF export capability
- **Authentication**: JWT tokens for secure sessions

## Getting Started

1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Run the application
5. Access at `http://localhost:3000`

## Default Credentials

- Admin: `admin@clinic.com` / `admin123`
- Staff: `staff@clinic.com` / `staff123`

## Project Status

🚀 **In Development** - Core features being built
