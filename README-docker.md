# Report Portal Dockerization

## Prerequisites
- Docker and Docker Compose installed

## Quick Start
1. Build and start all services:
   ```sh
   docker-compose up --build
   ```
2. Access the frontend at http://localhost:3000
3. Backend API runs at http://localhost:5000
4. MySQL database runs at port 3307 (host)

## Database
- MySQL 8.0, database: `report_portal`, user: `admin`, password: `admin`
- Data is persisted in the `db_data` Docker volume

## Environment Variables
- Backend reads DB config from `.env` (see backend/.env)

## Notes
- On first run, Sequelize will auto-create tables.
- For custom DB initialization, add SQL scripts or Sequelize seeders as needed.
