# Report Portal

A full-stack web application for displaying automation test results with user authentication, historical data visualization, and a modern UI.

## Features
- User authentication (admin/user roles)
- Admin can register new users
- Historical test results with bar graph and date-wise summary
- Modern UI with Material-UI and Chart.js
- Backend: Node.js, Express, Sequelize, MySQL
- Frontend: React, Material-UI, Chart.js

## Prerequisites
- Node.js (v16 or higher)
- MySQL (running, with a user `admin`/`admin` and a database `report_portal` on port 3307)

## Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Ensure MySQL is running on port 3307 and the database `report_portal` exists. If not, create it:
   ```sql
   CREATE DATABASE report_portal;
   ```
4. Start the backend server:
   ```sh
   node index.js
   ```
   The backend will run on http://localhost:5000

## Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Build the application using:
      npm run build
   
4. Start the React development server:
   ```sh
   npm start
   ```
   The frontend will run on http://localhost:3000

## Make the server up using Docker
```sh
docker-compose up --build
```

## To make only db up and running
docker compose -f db.yml up

## Usage
- Register a user (admin can register new users)
- Login to view the dashboard
- Dashboard displays historical test results (mock data by default)

## Customization
- To connect to real test data, update the backend to ingest and serve test results from your automation framework (e.g., Allure reports)
- Update the frontend to fetch and display real data from the backend

## Tech Stack
- **Backend:** Node.js, Express, Sequelize, MySQL
- **Frontend:** React, Material-UI, Chart.js

## Prerequisites
- Docker and Docker Compose installed

## Docker Quick Start
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

## Building and Pushing Docker Images
1. Build your images with the correct tags:
    ```sh
    docker build -t sudheerk2907/reportportal-backend ./backend
    docker build -t sudheerk2907/reportportal-frontend ./frontend
    ```
2. Log in to Docker Hub:
    ```sh
    docker login
    ```
3. Push the images:
    ```sh
    docker push sudheerk2907/reportportal-backend
    docker push sudheerk2907/reportportal-frontend
    ```
4. On your Ubuntu server, pull the images:
    ```sh
    docker pull sudheerk2907/reportportal-backend
    docker pull sudheerk2907/reportportal-frontend
    ```
5. Update your `docker-compose.yml` to use these images:
    ```yaml
    services:
       backend:
          image: sudheerk2907/reportportal-backend
          ports:
             - "5000:5000"
          environment:
             # ...your env vars...
          depends_on:
             - db
       frontend:
          image: sudheerk2907/reportportal-frontend
          ports:
             - "3000:3000"
          depends_on:
             - backend
       db:
          image: mysql:8.0
          # ...your db config...
    ```
6. Start all services:
    ```sh
    docker-compose up -d
    ```

## Troubleshooting
- If you see port conflicts, make sure no other services are running on those ports.
- If images fail to pull, check your Docker Hub login and image names.
- For database connection issues, verify environment variables and MySQL health.