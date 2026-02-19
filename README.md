# Report Portal

A full-stack web application for displaying automation test results with user authentication, historical data visualization, and trend analysis. Integrated with Playwright automation testing framework.

## 🎯 Features

- 👤 User authentication (admin/user roles)
- 📊 Historical test results with interactive charts
- 📈 Pass/Fail trend analysis (date-wise and weekly)
- ⏱️ Execution time tracking for test runs
- 🎨 Modern UI with Material-UI and Chart.js
- 🔍 Detailed test reports with failure logs
- � **Screenshot capture for failed test cases**
- �🐳 Docker-ready deployment
- 🚀 Automated test result ingestion from Playwright

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, Sequelize, MySQL 8.0
- **Frontend:** React, Material-UI, Chart.js, React Router
- **Testing Integration:** Playwright custom reporter
- **Deployment:** Docker, Docker Compose

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Windows Deployment](#windows-deployment)
5. [Ubuntu/Linux Deployment](#ubuntulinux-deployment)
6. [Test Integration](#test-integration)
7. [API Documentation](#api-documentation)
8. [Database](#database)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd automationReportPortal

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

**Default Credentials:**
- Username: `gcadmin`
- Password: `gcsecret`

---

## 💻 Local Development

### Prerequisites
- Node.js (v16 or higher)
- MySQL 8.0
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Configure environment variables
# Create .env file with:
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=report_portal
# DB_USER=admin
# DB_PASS=admin
# PORT=5000

# Create database
mysql -u root -p
CREATE DATABASE report_portal;

# Start backend
node index.js
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm start
```

Frontend will run on `http://localhost:3000`

---

## 🐳 Docker Deployment

### Architecture

Docker Compose orchestrates three services:
- **MySQL (db)**: Database on port 3308 (host) → 3306 (container)
- **Backend**: Node.js API on port 5000
- **Frontend**: React application on port 3000

### Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Development with volume mounts |
| `windows-docker-compose.yml` | Windows production deployment |
| `ubuntu-docker-compose.yml` | Ubuntu production deployment |

### Start Services

```bash
# Development (with hot reload)
docker-compose up --build

# Production (detached mode)
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Database Initialization

- Sequelize auto-creates tables on first run
- Default admin user is created automatically
  - Username: `admin`
  - Password: `admin`

---

## 🪟 Windows Deployment

### Prerequisites
- Windows 10/11 or Windows Server
- Docker Desktop installed and running
- Docker Hub account (grasrvc001)

### Quick Setup

```powershell
# 1. Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/

# 2. Login to Docker Hub
docker login
# Username: grasrvc001

# 3. Create deployment directory
New-Item -ItemType Directory -Path C:\reportportal -Force
cd C:\reportportal

# 4. Copy windows-docker-compose.yml to this directory as docker-compose.yml

# 5. Start services
docker-compose up -d

# 6. Check status
docker ps

# 7. View logs
docker-compose logs -f
```

### Access Application
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

### Firewall Configuration

```powershell
# Allow application ports
New-NetFirewallRule -DisplayName "Report Portal Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "Report Portal Backend" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

### Auto-start on Windows Boot

**Option 1: Task Scheduler**
1. Open Task Scheduler
2. Create Basic Task → "Report Portal Auto Start"
3. Trigger: At system startup
4. Action: Start a program
   - Program: `powershell.exe`
   - Arguments: `-Command "cd C:\reportportal; docker-compose up -d"`

**Option 2: Startup Script**
Create `C:\reportportal\startup.bat`:
```batch
@echo off
cd C:\reportportal
docker-compose up -d
```
Place shortcut in: `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup`

---

## 🐧 Ubuntu/Linux Deployment

### Prerequisites
- Ubuntu 20.04 or higher
- Docker and Docker Compose installed

### Install Docker

```bash
# Update system
sudo apt update

# Install Docker
sudo apt install -y docker.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Deploy Application

```bash
# 1. Login to Docker Hub
docker login
# Username: grasrvc001

# 2. Create deployment directory
mkdir -p ~/reportportal
cd ~/reportportal

# 3. Copy ubuntu-docker-compose.yml as docker-compose.yml

# 4. Start services
docker-compose up -d

# 5. Check status
docker ps

# 6. View logs
docker-compose logs -f
```

### Access Application
- Frontend: `http://your-server-ip:3000`
- Backend: `http://your-server-ip:5000`

### Firewall Configuration (UFW)

```bash
# Allow application ports
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 5000/tcp  # Backend
sudo ufw allow 80/tcp    # HTTP (optional)
sudo ufw allow 443/tcp   # HTTPS (optional)

# Check status
sudo ufw status
```

---

## 🔗 Test Integration

### Playwright Integration

The custom reporter `rp.js` automatically sends test results to the backend.

**Location:** `frameworkIntegrations/rp.js`

### Features
- ✅ Automatic run ID generation (timestamp-based)
- ⏱️ Total execution time calculation
- 📝 Detailed error messages with stack traces
- 🔗 HTML report path storage
- 🎯 Test status normalization
- 📸 **Screenshot capture and upload for failed tests**

### Playwright Configuration

```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['html'],
    ['allure-playwright'],
    ['./frameworkIntegrations/rp.js']  // Custom reporter
  use: {
    screenshot: 'only-on-failure',  // Enable screenshot capture
  },
  ],
  // ... other config
});
```

### Usage

```bash
# Run tests
npx playwright test

# Results are automatically sent to:
# POST http://localhost:5000/api/results

# View HTML report
npx playwright show-report

# Generate Allure report
npx allure generate ./allure-results --clean -o ./allure-report
npx serve ./allure-report
```

### Reporter Output

The reporter sends data in this format:
```json
{
  "framework": "qa-playwright",
  "suite": "Test Suite Name",
  "testName": "test case name",
  "status": "passed",
  "duration": 1234,
  "errorMessage": null,
  "run_id": "1737388800000",
  "timestamp": "2026-02-18T18:00:00.000Z",
  "executionTime": "5m 30s",
  "htmlReportPath": "D:\\workspace\\playwright-report\\index.html",
  "screenshots": [
    {
      "filename": "test_login-123456.png",
      "url": "/uploads/screenshots/1737388800000/test_login-123456.png",
      "size": 245678
    }
  ]
}
```

### Screenshot Capture

The reporter automatically captures screenshots for failed tests:
- Screenshots are extracted from Playwright test attachments
- **Uploaded to backend file system** (organized by run_id)
- Stored at `backend/uploads/screenshots/{run_id}/`
- Only URLs are saved in database for optimal performance
- Displayed in the test run details page
- Click on any screenshot to view full size
- **Automatic cleanup**: Only last 30 test runs' screenshots are kept

**Storage Structure:**
```
backend/uploads/screenshots/
├── 1739388800000/           # run_id (timestamp)
│   ├── test_login-123456.png
│   └── test_checkout-789012.png
└── 1739389900000/
    └── ...
```

**Requirements:**
- Ensure `screenshot: 'only-on-failure'` is set in your `playwright.config.js`
- Screenshots are automatically captured by Playwright on test failures
- Maximum size: 10MB per screenshot (configurable in backend)
- Docker volume `screenshots_data` persists screenshots across restarts

---

## 📡 API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `http://your-server:5000/api`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user",
  "password": "password",
  "role": "user"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

Response:
```json
{
  "token": "jwt-token",
  "role": "admin"
}
```

### Test Results Endpoints

#### Submit Test Result
```http
POST /api/results
Content-Type: application/json

{
  "framework": "playwright",
  "suite": "LoginSuite",
  "testName": "test_valid_login",
  "status": "passed",
  "duration": 1.23,
  "errorMessage": null,
  "timestamp": "2026-01-20T17:00:00Z",
  "run_id": "1737388800000",
  "executionTime": "5m 30s",
  "htmlReportPath": "path/to/report.html",
  "extra": { "browser": "chrome", "env": "staging" },
  "screenshots": [
    {
      "filename": "test_login-123456.png",
      "url": "/uploads/screenshots/1737388800000/test_login-123456.png",
      "size": 245678
    }
  ]
}
```

**Field Descriptions:**
- `framework` (string, required): Test framework name
- `suite` (string, optional): Test suite name
- `testName` (string, required): Test case name
- `status` (string, required): `passed`, `failed`
- `screenshots` (array, optional): Array of screenshot objects with `name`, `contentType`, and `data` (base64) fields, or `skipped`
- `duration` (float, optional): Duration in milliseconds
- `errorMessage` (string, optional): Error details for failed tests
- `timestamp` (string, optional): ISO timestamp
- `run_id` (string, required): Unique run identifier
- `executionTime` (string, optional): Human-readable time (e.g., "5m 30s")
- `htmlReportPath` (string, optional): Path to HTML report
- `extra` (object, optional): Additional metadata

#### Get All Results
```http
GET /api/results
```

#### Upload Screenshots
```http
POST /api/results/upload-screenshots
Content-Type: multipart/form-data

FormData:
- screenshots: (files) - Array of screenshot files (max 10, 10MB each)
- run_id: (string) - Test run identifier
- testName: (string) - Test case name
```

Response:
```json
{
  "message": "Screenshots uploaded successfully",
  "files": [
    {
      "filename": "test_login-123456.png",
      "url": "/uploads/screenshots/1737388800000/test_login-123456.png",
      "size": 245678
    }
  ]
}
```

#### Delete Results by Run ID
```http
DELETE /api/results/run/:run_id
```

---

## 🗄️ Database

### Configuration

**Connection Details:**
- Host: `db` (Docker) or `localhost` (local)
- Port: `3306` (internal) / `3308` (host)
- Database: `report_portal`
- User: `admin`
- Password: `admin`

### Schema

**TestResults Table:**
- `id`: Primary key
- `framework`: Test framework name
- `suite`: Test suite
- `testName`: Test case name
- `status`: passed/failed/skipped
- `duration`: Test duration (ms)
- `errorMessage`: Error details
- `timestamp`: Test execution time
- `run_id`: Test run identifier
- `executionTime`: Human-readable duration
- `htmlReportPath`: Report file path
- `screenshots`: JSON array of screenshot URLs (e.g., `[{filename, url, size}]`)
- `extra`: JSON metadata
- `createdAt`: Record creation time
- `updatedAt`: Record update time

**Users Table:**
- `id`: Primary key
- `username`: Unique username
- `password`: Hashed password
- `role`: admin/user
- `createdAt`: User creation time
- `updatedAt`: User update time

### Database Management

#### Access MySQL Container
```bash
# Using Docker
docker exec -it reportportal-db mysql -u admin -padmin report_portal
```

#### Backup Database
```bash
# Windows (PowerShell)
docker exec reportportal-db mysqldump -u admin -padmin report_portal > backup_$(Get-Date -Format 'yyyyMMdd').sql

# Linux/Ubuntu
docker exec reportportal-db mysqldump -u admin -padmin report_portal > backup_$(date +%Y%m%d).sql
```

#### Restore Database
```bash
# Windows
Get-Content backup_20260218.sql | docker exec -i reportportal-db mysql -u admin -padmin report_portal

# Linux
docker exec -i reportportal-db mysql -u admin -padmin report_portal < backup_20260218.sql
```

#### Delete Test Results
```sql
-- Delete by run_id
DELETE FROM TestResults WHERE run_id='1737388800000';

-- If safe update mode is enabled:
SET SQL_SAFE_UPDATES = 0;
DELETE FROM TestResults WHERE run_id='1737388800000';
SET SQL_SAFE_UPDATES = 1;
```

#### Data Retention
- Backend automatically keeps only the last 30 unique `run_id` per project
- Older test runs are automatically cleaned up
- **Screenshot files**: Only screenshots from last 30 runs are kept on disk
- Cleanup happens automatically after each test submission

#### Screenshot Storage
Screenshots are stored in a Docker volume for persistence:
```bash
# View screenshot volumes
docker volume ls | grep screenshots

# Backup screenshots
docker run --rm -v reportportal_screenshots_data:/source -v $(pwd):/backup ubuntu tar czf /backup/screenshots-backup-$(date +%Y%m%d).tar.gz -C /source .

# Restore screenshots
docker run --rm -v reportportal_screenshots_data:/target -v $(pwd):/backup ubuntu tar xzf /backup/screenshots-backup-YYYYMMDD.tar.gz -C /target
```

File structure:
```
screenshots_data/
└── screenshots/
    ├── 1737388800000/          # run_id
    │   ├── test_login-123.png
    │   └── test_checkout-456.png
    └── 1737475200000/
        └── ...
```

---

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Check what's using the port
# Windows:
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Linux:
lsof -i :3000
lsof -i :5000

# Solution: Stop the process or change ports in docker-compose.yml
```

**Docker Not Running:**
```bash
# Check Docker status
docker version

# Windows: Start Docker Desktop from Start Menu
# Linux: sudo systemctl start docker
```

**Backend Cannot Connect to Database:**
- Ensure `DB_HOST=db` in Docker environment
- Check MySQL container is healthy: `docker ps`
- View logs: `docker-compose logs db`

**MySQL Port Conflicts:**
- Change host port in `docker-compose.yml` (e.g., 3308 → 3309)
- Update `DB_PORT` accordingly if accessing externally

**Frontend Not Building:**
- Clear cache: `docker-compose build --no-cache frontend`
- Check logs: `docker-compose logs frontend`
- Verify all dependencies in `package.json`

**Permission Denied (Linux):**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and log back in
```

### Useful Commands

```bash
# View all container logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart specific service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build

# Check container stats
docker stats

# Remove old images
docker image prune -f

# Remove everything (including volumes)
docker-compose down -v
```

---

## 🔄 Update Workflow

### When Code Changes

**On Development Machine (Windows):**

```powershell
# Build new images
docker build -t grasrvc001/reportportal:backend ./backend
docker build -t grasrvc001/reportportal:frontend ./frontend

# Login to Docker Hub
docker login

# Push images
docker push grasrvc001/reportportal:backend
docker push grasrvc001/reportportal:frontend
```

**Or use the automated script:**
```powershell
.\docker-push.ps1
```

**On Production Server:**
```bash
cd ~/reportportal

# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d

# Clean up old images
docker image prune -f
```

---

## 🔐 Production Considerations

### Security

1. **Change Default Passwords**
   ```yaml
   # In docker-compose.yml
   environment:
     MYSQL_PASSWORD: <strong-password>
     MYSQL_ROOT_PASSWORD: <strong-root-password>
     DB_PASS: <strong-password>
   ```

2. **Use Environment Files**
   ```bash
   # Create .env file
   DB_PASS=strong_password
   JWT_SECRET=your_secret_key
   ```

3. **Make Docker Hub Repositories Private**
   - Go to: https://hub.docker.com/repositories/grasrvc001
   - Settings → Change visibility to Private

### SSL/TLS Configuration

Use nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
  **Screenshots are persisted in `screenshots_data` Docker volume**
- Frontend uses React Router for navigation
- Charts update dynamically based on selected filters
- Execution time is tracked per test run
- Supports date-wise and weekly trend analysis
- Failed test logs are displayed in red for easy debugging
- **Screenshots are automatically cleaned up** - only last 30 runs retained
- Screenshot storage uses file system for optimal performance
```

### Monitoring

```bash
# Monitor resource usage
docker stats

# Set up alerts for container health
docker inspect reportportal-backend | grep Health

# Log rotation
# Docker automatically handles log rotation
# Configure in: /etc/docker/daemon.json
```

---

## 📝 Additional Notes

- Database data is persisted in `db_data` Docker volume
- Frontend uses React Router for navigation
- Charts update dynamically based on selected filters
- Execution time is tracked per test run
- Supports date-wise and weekly trend analysis
- Failed test logs are displayed in red for easy debugging

---

## 📄 License

[Your License Here]

## 🤝 Contributing

[Contributing Guidelines]

## 📧 Support

For issues and questions:
- Create an issue in the repository
- Contact: [your-email]

---

**Last Updated:** February 2026