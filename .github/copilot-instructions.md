# Copilot Instructions for Report Portal

## 1. Dockerization & Setup
- Docker Compose orchestrates three services: MySQL (db), backend (Node/Express/Sequelize), frontend (React).
- Backend and frontend each have their own Dockerfile.
- Backend .env file configures DB connection: `DB_HOST=db`, `DB_PORT=3306`, `DB_NAME=report_portal`, `DB_USER=admin`, `DB_PASS=admin`, `PORT=5000`.
- MySQL port is mapped to 3308 on host (change in docker-compose.yml if needed).
- To start: `docker-compose up --build`

## 2. Database Initialization
- Sequelize's `sequelize.sync()` in backend/index.js auto-creates tables from models.
- On backend start, a default admin user (username: admin, password: admin) is created if not present.

## 3. Test Result Integration
- Playwright automation uses a custom reporter (rp.js) to POST results to backend `/api/results`.
- Each result includes: framework, suite, testName, status, duration, errorMessage, run_id, timestamp, and htmlReportPath.
- Playwright config example:
  ```js
  reporter: [
    ['html'],
    ['allure-playwright'],
    ['./rp.js']
  ]
  ```
- After tests, generate Playwright HTML report:
  ```sh
  npx playwright show-report
  ```
- For Allure reports:
  ```sh
  npx allure generate ./allure-results --clean -o ./allure-report
  npx serve ./allure-report
  ```

## 4. Backend API Changes
- TestResult model has `htmlReportPath` field for storing HTML report location.
- Backend accepts and stores this path with each result.

## 5. Frontend Changes
- Dashboard.js formats run_id as date/time if it looks like a timestamp.
- To link HTML reports: fetch `htmlReportPath` from API and link in UI (not yet fully implemented).

## 6. Troubleshooting
- If MySQL port is in use, change host port in docker-compose.yml and backend/.env/models/index.js.
- If backend cannot connect to DB, ensure DB_HOST is `db` and DB_PORT is `3306`.
- Serve HTML reports with a static server (e.g., `npx serve`).

## 7. File Locations
- Dockerfiles: `backend/Dockerfile`, `frontend/Dockerfile`
- Custom reporter: `frameworkRelatedFiles/rp.js` (or as configured)
- Allure/Playwright reports: `allure-report/`, `playwright-report/`

## 8. Adding New Features
- Update this file with any new setup, config, or integration steps for future reference.


## 9. Detailed Reports and Failure Logs
- The dashboard graph supports clicking bars or using the "View Detailed Reports" button to open a modal with all passed and failed test cases for a run.
- For failed test cases, the errorMessage (failure log) is displayed in red for easy debugging.
- The modal also provides a link to the HTML report if available.

## 10. Database Management
- To delete test results for a specific run, use:
  ```sql
  DELETE FROM TestResults WHERE run_id='YOUR_RUN_ID';
  ```
- If you encounter safe update mode errors, use the primary key in your WHERE clause or temporarily disable safe updates:
  ```sql
  SET SQL_SAFE_UPDATES = 0;
  DELETE FROM TestResults WHERE run_id='YOUR_RUN_ID';
  SET SQL_SAFE_UPDATES = 1;
  ```

---
This file is for Copilot and user reference. Update as you make changes to keep instructions current.
