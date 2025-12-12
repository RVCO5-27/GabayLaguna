# Quick Start Commands Guide
## Gabay Laguna - Backend & Frontend Setup

This guide provides all the commands needed to set up, migrate, and run the backend and frontend.

---

## 📋 Prerequisites

Make sure you have installed:
- **PHP 8.2+** with Composer
- **Node.js 18+** with npm
- **MySQL** or **PostgreSQL** database
- **Git** (optional)

---

## 🔧 Backend Setup & Commands

### **Initial Setup (First Time Only)**

```bash
# Navigate to backend directory
cd gabay-laguna-backend

# Install PHP dependencies
composer install

# Copy environment file
copy .env.example .env
# OR on Linux/Mac:
# cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
# Edit .env and set:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=gabay_laguna
# DB_USERNAME=root
# DB_PASSWORD=your_password
```

### **Database Migration Commands**

```bash
# Navigate to backend directory
cd gabay-laguna-backend

# Run all migrations
php artisan migrate

# Run migrations with seed data (recommended for first time)
php artisan migrate --seed

# Rollback last migration
php artisan migrate:rollback

# Rollback all migrations
php artisan migrate:reset

# Refresh database (drop all tables and re-run migrations)
php artisan migrate:fresh

# Refresh with seed data
php artisan migrate:fresh --seed

# Check migration status
php artisan migrate:status
```

### **Run Backend Server**

```bash
# Navigate to backend directory
cd gabay-laguna-backend

# Start Laravel development server (default: http://localhost:8000)
php artisan serve

# Start on specific port
php artisan serve --port=8000

# Start on specific host and port
php artisan serve --host=127.0.0.1 --port=8000
```

### **Other Useful Backend Commands**

```bash
# Clear application cache
php artisan cache:clear

# Clear configuration cache
php artisan config:clear

# Clear route cache
php artisan route:clear

# Clear view cache
php artisan view:clear

# Optimize application (production)
php artisan optimize

# Run queue worker (for background jobs)
php artisan queue:work

# Run tests
php artisan test

# Check Laravel version
php artisan --version
```

---

## 🎨 Frontend Setup & Commands

### **Initial Setup (First Time Only)**

```bash
# Navigate to frontend directory
cd gabay-laguna-frontend

# Install Node.js dependencies
npm install

# Create .env.local file (optional, for custom API URL)
# Create file: .env.local
# Add: REACT_APP_API_BASE_URL=http://localhost:8000
```

### **Run Frontend Server**

```bash
# Navigate to frontend directory
cd gabay-laguna-frontend

# Start React development server (default: http://localhost:3000)
npm start

# The browser will automatically open at http://localhost:3000
```

### **Other Useful Frontend Commands**

```bash
# Build for production
npm run build

# Run tests
npm test

# Check for outdated packages
npm outdated

# Update packages
npm update
```

---

## 🚀 Complete Setup Workflow

### **Step-by-Step Complete Setup**

#### **1. Backend Setup**

```bash
# Open Terminal/Command Prompt 1

# Navigate to backend
cd GabayLaguna\gabay-laguna-backend

# Install dependencies
composer install

# Setup environment
copy .env.example .env
php artisan key:generate

# Edit .env file with your database credentials
# Then run migrations
php artisan migrate --seed

# Start backend server
php artisan serve
# Backend will run on http://localhost:8000
```

#### **2. Frontend Setup**

```bash
# Open NEW Terminal/Command Prompt 2

# Navigate to frontend
cd GabayLaguna\gabay-laguna-frontend

# Install dependencies
npm install

# Start frontend server
npm start
# Frontend will run on http://localhost:3000
```

---

## 📝 Windows CMD Commands (Quick Reference)

### **Backend Commands (Windows CMD)**

```cmd
REM Navigate to backend
cd GabayLaguna\gabay-laguna-backend

REM Install dependencies
composer install

REM Setup environment
copy .env.example .env
php artisan key:generate

REM Run migrations
php artisan migrate --seed

REM Start server
php artisan serve
```

### **Frontend Commands (Windows CMD)**

```cmd
REM Navigate to frontend
cd GabayLaguna\gabay-laguna-frontend

REM Install dependencies
npm install

REM Start server
npm start
```

---

## 🐛 Troubleshooting Commands

### **Backend Issues**

```bash
# If migration fails, try:
php artisan migrate:fresh --seed

# If cache issues:
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# If permission issues (Linux/Mac):
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Check PHP version
php -v

# Check Composer version
composer --version
```

### **Frontend Issues**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install

# On Windows:
rmdir /s /q node_modules
npm install

# Check Node.js version
node -v

# Check npm version
npm -v
```

---

## 🔄 Daily Development Workflow

### **Starting Development (Every Day)**

```bash
# Terminal 1 - Backend
cd GabayLaguna\gabay-laguna-backend
php artisan serve

# Terminal 2 - Frontend
cd GabayLaguna\gabay-laguna-frontend
npm start
```

### **After Code Changes**

```bash
# Backend: Usually auto-reloads, but if needed:
php artisan config:clear
php artisan cache:clear

# Frontend: Usually auto-reloads (Hot Module Replacement)
# If not working, restart: Ctrl+C then npm start
```

---

## 📊 Database Management Commands

### **Common Database Operations**

```bash
# Create new migration
php artisan make:migration create_table_name

# Create model with migration
php artisan make:model ModelName -m

# Create controller
php artisan make:controller ControllerName

# Seed specific seeder
php artisan db:seed --class=CategoriesSeeder

# Reset and reseed
php artisan migrate:fresh --seed
```

---

## 🌐 Access URLs

After running both servers:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Health Check**: http://localhost:8000/api/health
- **Backend Root**: http://localhost:8000

---

## ⚡ Quick Commands Summary

### **Backend**
```bash
cd gabay-laguna-backend
composer install                    # Install dependencies
php artisan migrate --seed          # Setup database
php artisan serve                   # Start server
```

### **Frontend**
```bash
cd gabay-laguna-frontend
npm install                         # Install dependencies
npm start                           # Start server
```

---

## 📌 Important Notes

1. **Always run backend first** before starting frontend
2. **Keep both terminals open** - one for backend, one for frontend
3. **Backend runs on port 8000** - make sure it's not in use
4. **Frontend runs on port 3000** - make sure it's not in use
5. **Database must be running** before running migrations
6. **.env file must be configured** with correct database credentials

---

## 🔐 Default Login Credentials

After running `php artisan migrate --seed`, you can login with:

- **Admin**: 
  - Email: `admin@gabaylaguna.com`
  - Password: `Password123!`

- **Tour Guide**: 
  - Email: `guide@gabaylaguna.com`
  - Password: `Password123!`

- **Tourist**: 
  - Email: `tourist@gabaylaguna.com`
  - Password: `Password123!`

---

**Last Updated**: Current Review  
**For more details**: See `DEPLOYMENT_GUIDE.md` and `SETUP_GUIDE.md`

