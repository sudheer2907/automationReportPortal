# Report Portal Backend

This is the backend for the Report Portal project, built with Node.js and Express. It provides authentication, role management, and endpoints for ingesting and serving test automation data (Allure reports).

## Features
- User registration and login (JWT-based authentication)
- Role management (admin, user)
- Allure report ingestion (to be implemented)
- Historical data and trend analysis (to be implemented)

## Project Structure
```
backend/
  controllers/      # Route handlers (e.g., authController.js)
  middleware/       # Authentication middleware (e.g., auth.js)
  models/           # Mongoose models (e.g., User.js)
  routes/           # Express routes (e.g., auth.js)
  package.json      # Project dependencies
```

## Prerequisites
- Node.js >= 16.x
- MongoDB (running locally or in the cloud)

## Setup & Run
1. Install dependencies:
   ```sh
   npm install
   ```
2. Set environment variables (optional):
   - `JWT_SECRET` (default: 'secretkey')
   - `MONGO_URI` (default: 'mongodb://localhost:27017/report-portal')
3. Start the server:
   ```sh
   node index.js
   ```

## API Endpoints
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT
- `POST /api/results` — Submit a test result (see below)

### Test Result Submission Example
POST /api/results
Content-Type: application/json

Request body:
```
{
  "framework": "pytest",
  "suite": "LoginSuite",
  "testName": "test_valid_login",
  "status": "passed",
  "duration": 1.23,
  "errorMessage": null,
  "timestamp": "2026-01-20T17:00:00Z",
  "run_id": "1737388800000",
  "executionTime": "5m 30s",
  "extra": { "browser": "chrome", "env": "staging" }
}
```

- `framework` (string, required): Name of the test framework (e.g., pytest, cypress, playwright, selenium)
- `suite` (string, optional): Test suite or group name
- `testName` (string, required): Name of the test case
- `status` (string, required): One of `passed`, `failed`, `skipped`
- `duration` (float, optional): Duration in seconds
- `errorMessage` (string, optional): Error message if failed
- `timestamp` (string, optional): ISO timestamp
- `run_id` (string, required): Unique identifier for the test run
- `executionTime` (string, optional): Human-readable execution time (e.g., "5m 30s", "2h 15m")
- `extra` (object, optional): Any additional metadata

## Next Steps
- Implement Allure report ingestion endpoints
- Add endpoints for test result retrieval and trend analysis
