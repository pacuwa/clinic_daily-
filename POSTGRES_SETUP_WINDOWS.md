# PostgreSQL Setup Guide for Windows

## Step 1: Install PostgreSQL

1. Download PostgreSQL installer from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard:
   - Choose installation directory (default is fine)
   - Select components (keep defaults: PostgreSQL Server, pgAdmin, Stack Builder)
   - Set a password for the `postgres` superuser (remember this!)
   - Keep port as `5432` (default)
   - Select locale (default is fine)
3. Complete the installation

## Step 2: Verify PostgreSQL Installation

Open Command Prompt (cmd) or PowerShell and run:
```bash
psql --version
```

You should see the PostgreSQL version displayed.

## Step 3: Create the Database

1. Open Command Prompt or PowerShell
2. Connect to PostgreSQL as the superuser:
   ```bash
   psql -U postgres
   ```
   (Enter the password you set during installation)

3. Create the clinic inventory database:
   ```sql
   CREATE DATABASE clinic_inventory;
   ```

4. Verify the database was created:
   ```sql
   \l
   ```

5. Exit psql:
   ```sql
   \q
   ```

## Step 4: Configure Environment Variables

1. Navigate to your project root directory:
   ```bash
   cd path\to\clinic_daily-
   ```

2. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

3. Edit `.env` with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=clinic_inventory
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   ```
   Replace `your_postgres_password` with the password you set during PostgreSQL installation.

## Step 5: Install Node Dependencies

In Command Prompt/PowerShell, from the project root:
```bash
npm install
```

This will install all required packages including `pg` and `pg-promise`.

## Step 6: Seed the Database

Run the seed script to initialize tables and insert sample data:
```bash
npm run seed
```

You should see output like:
```
Initializing database...
Hashing passwords...
Inserting admin user...
Inserting staff user...
Inserting sample items...

=== Database seeded successfully ===
Default Admin: admin@clinic.com / admin123
Default Staff: staff@clinic.com / staff123
```

## Step 7: Start the Application

Run the development server:
```bash
npm run dev
```

You should see:
```
🏥 Clinic Daily Server Running
📍 http://localhost:3000
🔐 Default Admin: admin@clinic.com / admin123
👥 Default Staff: staff@clinic.com / staff123

⚠️  Change default passwords after first login!
```

Open your browser and go to: `http://localhost:3000`

## Step 8: Login

Use the default credentials:
- **Admin Login:**
  - Email: `admin@clinic.com`
  - Password: `admin123`

- **Staff Login:**
  - Email: `staff@clinic.com`
  - Password: `staff123`

## Troubleshooting

### "psql is not recognized as an internal or external command"
- PostgreSQL was not added to PATH during installation
- Solution: Add PostgreSQL bin folder to PATH manually or reinstall PostgreSQL with the PATH option checked

### "Connection refused" error
- PostgreSQL service is not running
- Solution: 
  - Press `Win + R`, type `services.msc`
  - Find "postgresql-x64-*" service
  - Right-click and select "Start"

### "password authentication failed"
- Wrong password in `.env` file
- Solution: Check your `.env` file matches the password you set during PostgreSQL installation

### Database "clinic_inventory" does not exist
- The database wasn't created
- Solution: Run the SQL commands in Step 3 again

### "Node modules not found" error
- Dependencies weren't installed
- Solution: Run `npm install` again

## Optional: Using pgAdmin (GUI Database Manager)

pgAdmin was installed with PostgreSQL. To use it:

1. Open pgAdmin (search for "pgAdmin" in Windows Start Menu)
2. Right-click "Servers" in the left panel → Create → Server
3. Name: `clinic_inventory`
4. Connection tab:
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: (your PostgreSQL password)
5. Click "Save"

You can now view and manage your database through the GUI.

## Next Steps

1. Change default passwords after first login
2. Add your clinic/pharmacy information in the system
3. Start managing inventory!

For more help, check the README.md in the project root.
